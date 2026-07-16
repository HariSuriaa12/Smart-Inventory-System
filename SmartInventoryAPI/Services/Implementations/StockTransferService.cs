using System.Security.Cryptography.Xml;
using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Request.StockTransfer;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class StockTransferService : IStockTransferService
{
    private const int StatusShipped = 0;
    private const int StatusPartiallyReceived = 1;
    private const int StatusReceived = 2;
    private const int StatusCancelled = 3;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StockTransferService> _logger;
    private readonly IMapper _mapper;
    private readonly ILoggingService _loggingService;

    public StockTransferService(IUnitOfWork unitOfWork, ILogger<StockTransferService> logger, IMapper mapper, ILoggingService loggingService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
        _loggingService = loggingService;
    }

    public async Task<PaginatedResponseDto<StockTransferDto>> GetAllStockTransfersAsync(int skip = 0, int take = 10)
    {
        var total = await _unitOfWork.StockTransfers.CountAsync();
        var transfers = await _unitOfWork.StockTransfers.GetAllWithDetailsAsync(skip, take);
        var activetransfers = transfers.Where(t => !t.Is_Deleted).ToList();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<StockTransferDto>
        {
            Data = _mapper.Map<IEnumerable<StockTransferDto>>(activetransfers),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<PaginatedResponseDto<StockTransferDto>> GetFilteredAsync(
        long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null,
        long? itemId = null, string? dateFrom = null, string? dateTo = null,
        int skip = 0, int take = 10)
    {
        var total = await _unitOfWork.StockTransfers.CountFilteredAsync(id, status, fromLocationId, toLocationId, itemId, dateFrom, dateTo);
        var transfers = await _unitOfWork.StockTransfers.GetFilteredAsync(id, status, fromLocationId, toLocationId, itemId, dateFrom, dateTo, skip, take);

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<StockTransferDto>
        {
            Data = _mapper.Map<IEnumerable<StockTransferDto>>(transfers),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<IEnumerable<object>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByFromLocationAsync(locationId, skip, take);
        return transfers
            .Select(t => _mapper.Map<StockTransferDto>(t))
            .AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByToLocationAsync(locationId, skip, take);
        return transfers
            .Select(t => _mapper.Map<StockTransferDto>(t))
            .AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByStatusAsync(status, skip, take);
        return transfers
            .Select(t => _mapper.Map<StockTransferDto>(t))
            .AsEnumerable<object>();
    }

    public async Task<StockTransferDto> ReceiveStockAsync(long id, ReceiveStockRequestDto request)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Stock transfer with ID {id} not found");

        if (transfer.Is_Deleted)
            throw new InvalidOperationException("Cannot receive a deleted stock transfer");

        if (transfer.Status == StatusCancelled)
            throw new InvalidOperationException("Cannot receive a cancelled stock transfer");

        if (transfer.Status == StatusReceived)
            throw new InvalidOperationException("Stock transfer is already fully received");

        var fromInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(transfer.Item_ID, transfer.From_Location_ID);
        if (fromInventory == null || fromInventory.Is_Deleted)
            throw new NotFoundException("Source inventory not found");

        var toInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(transfer.Item_ID, transfer.To_Location_ID);
        if (toInventory == null || toInventory.Is_Deleted)
            throw new NotFoundException("Destination inventory not found");

        decimal totalReceived = transfer.Received_Quantity + request.ReceivedQuantity;
        if (totalReceived > transfer.Transfer_Quantity)
            throw new InvalidOperationException($"Received quantity cannot exceed transfer quantity ({transfer.Transfer_Quantity})");

        toInventory.On_Hand_Quantity += request.ReceivedQuantity;

        transfer.Received_Quantity = totalReceived + transfer.Received_Quantity;
        transfer.Status = totalReceived >= transfer.Transfer_Quantity ? StatusReceived : StatusPartiallyReceived;
        if (!string.IsNullOrWhiteSpace(request.Remark))
            transfer.Remark = request.Remark;

        var performLogId = await _loggingService.LogPerformanceAsync(
            performedBy: transfer.Performed_By,
            performedOutlet: transfer.To_Location_ID,
            performModule: 9, // Stock Transfer module
            operationType: 2, // Transfer operation
            performRemark: "Receive Stock Transfer",
            operationId: transfer.ID);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            transfer.Item_ID,
            transfer.To_Location_ID,
            request.ReceivedQuantity,
            0,
            performLogId);

        await _unitOfWork.Inventories.UpdateAsync(toInventory);
        await _unitOfWork.StockTransfers.UpdateAsync(transfer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation($"Stock transfer {id} received {request.ReceivedQuantity} units. Total received: {totalReceived}");

        return _mapper.Map<StockTransferDto>(transfer);
    }

    public async Task<StockTransferDto> CancelStockTransferAsync(long id, CancelStockTransferRequestDto request)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Stock transfer with ID {id} not found");

        if (transfer.Is_Deleted)
            throw new InvalidOperationException("Cannot cancel a deleted stock transfer");

        if (transfer.Status == StatusCancelled)
            throw new InvalidOperationException("Stock transfer is already cancelled");

        if (transfer.Status == StatusReceived)
            throw new InvalidOperationException("Cannot cancel a fully received stock transfer");

        var fromInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(transfer.Item_ID, transfer.From_Location_ID);
        if (fromInventory == null || fromInventory.Is_Deleted)
            throw new NotFoundException("Source inventory not found");

        var toInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(transfer.Item_ID, transfer.To_Location_ID);
        if (toInventory == null || toInventory.Is_Deleted)
            throw new NotFoundException("Destination inventory not found");

        var balanceQuantity = transfer.Transfer_Quantity - transfer.Received_Quantity;
        fromInventory.On_Hand_Quantity += balanceQuantity;
        fromInventory.Available_Quantity += balanceQuantity;
        toInventory.Available_Quantity -= balanceQuantity;

        var performLogId = await _loggingService.LogPerformanceAsync(
            performedBy: transfer.Performed_By,
            performedOutlet: transfer.From_Location_ID,
            performModule: 9, // Stock Transfer module
            operationType: 2, // Transfer operation
            performRemark: "Cancel Stock Transfer",
            operationId: transfer.ID);

        // Log inventory changes for source location
        await _loggingService.LogInventoryChangeAsync(
            transfer.Item_ID,
            transfer.From_Location_ID,
            balanceQuantity,
            balanceQuantity,
            performLogId);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            transfer.Item_ID,
            transfer.To_Location_ID,
            0,
            balanceQuantity * -1,
            performLogId);

        transfer.Status = StatusCancelled;
        if (!string.IsNullOrWhiteSpace(request.Remark))
            transfer.Remark = request.Remark;

        await _unitOfWork.StockTransfers.UpdateAsync(transfer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation($"Stock transfer {id} cancelled");

        return _mapper.Map<StockTransferDto>(transfer);
    }

    public async Task<StockTransferDto> CancelStockTransferWithReturnAsync(long id, CancelStockTransferRequestDto request)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Stock transfer with ID {id} not found");

        if (transfer.Is_Deleted)
            throw new InvalidOperationException("Cannot cancel a deleted stock transfer");

        if (transfer.Status == StatusCancelled)
            throw new InvalidOperationException("Stock transfer is already cancelled");

        if (transfer.Status == StatusShipped)
            throw new InvalidOperationException("Cannot cancel with return when transfer is still in shipped status");

        var fromInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(transfer.Item_ID, transfer.From_Location_ID);
        if (fromInventory == null || fromInventory.Is_Deleted)
            throw new NotFoundException("Source inventory not found");

        var toInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(transfer.Item_ID, transfer.To_Location_ID);
        if (toInventory == null || toInventory.Is_Deleted)
            throw new NotFoundException("Destination inventory not found");

        decimal returnQuantity = transfer.Received_Quantity;
        fromInventory.On_Hand_Quantity += transfer.Transfer_Quantity;
        fromInventory.Available_Quantity += transfer.Transfer_Quantity;
        toInventory.On_Hand_Quantity -= returnQuantity;
        toInventory.Available_Quantity -= returnQuantity;
        transfer.Status = StatusCancelled;
        transfer.Received_Quantity = 0;
        if (!string.IsNullOrWhiteSpace(request.Remark))
            transfer.Remark = request.Remark;

        var performLogId = await _loggingService.LogPerformanceAsync(
            performedBy: transfer.Performed_By,
            performedOutlet: transfer.From_Location_ID,
            performModule: 9, // Stock Transfer module
            operationType: 2, // Transfer operation
            performRemark: "Cancel Stock Transfer with Return",
            operationId: transfer.ID);

        // Log inventory changes for source location
        await _loggingService.LogInventoryChangeAsync(
            transfer.Item_ID,
            transfer.From_Location_ID,
            transfer.Transfer_Quantity,
            transfer.Transfer_Quantity,
            performLogId);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            transfer.Item_ID,
            transfer.To_Location_ID,
            returnQuantity * -1,
            returnQuantity * -1,
            performLogId);

        await _unitOfWork.Inventories.UpdateAsync(toInventory);
        await _unitOfWork.Inventories.UpdateAsync(fromInventory);
        await _unitOfWork.StockTransfers.UpdateAsync(transfer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation($"Stock transfer {id} cancelled with return of {returnQuantity} units");

        return _mapper.Map<StockTransferDto>(transfer);
    }

    public async Task<InventoryDto> StockTransferAsync(StockTransferRequestDto request, long userId)
    {
        var fromInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.Item_ID, request.From_Location_ID);
        if (fromInventory == null || fromInventory.Is_Deleted)
            throw new NotFoundException("Source inventory not found");

        if (fromInventory.Available_Quantity < request.Transfer_Quantity)
            throw new BadRequestException("Insufficient stock for transfer");

        var toInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.Item_ID, request.To_Location_ID);
        if (toInventory == null || toInventory.Is_Deleted)
            throw new NotFoundException("Destination inventory not found");

        var item = await _unitOfWork.Items.GetByIdAsync(request.Item_ID);
        if (item == null || item.Is_Deleted)
            throw new NotFoundException("item not found");

        // Store previous values for logging
        var fromPreviousOnhand = fromInventory.On_Hand_Quantity;
        var fromPreviousAvailable = fromInventory.Available_Quantity;
        var toPreviousOnhand = toInventory.On_Hand_Quantity;
        var toPreviousAvailable = toInventory.Available_Quantity;

        // Deduct from source
        fromInventory.Available_Quantity -= request.Transfer_Quantity;
        await _unitOfWork.Inventories.UpdateAsync(fromInventory);

        // Add to destination
        toInventory.On_Hand_Quantity += request.Transfer_Quantity;
        //toInventory.Available_Quantity += request.Transfer_Quantity;
        await _unitOfWork.Inventories.UpdateAsync(toInventory);

        // Create transfer record
        var transfer = new StockTransfer
        {
            From_Location_ID = request.From_Location_ID,
            To_Location_ID = request.To_Location_ID,
            Item_ID = request.Item_ID,
            Transfer_Quantity = request.Transfer_Quantity,
            Remark = request.Remark,
            Status = 0,
            Transfer_Date = DateTime.UtcNow.Date,
            Transfer_Time = DateTime.UtcNow.TimeOfDay,
            Sub_Total = item.Unit_Cost * request.Transfer_Quantity,
            Performed_By = userId
        };

        await _unitOfWork.StockTransfers.AddAsync(transfer);
        await _unitOfWork.SaveAsync();

        // Log performance
        var transferRemark = string.IsNullOrEmpty(request.Remark)
            ? "Stock Transfer"
            : $"Stock Transfer : {request.Remark}";

        await _loggingService.LogPerformanceAsync(
            performedBy: userId,
            performedOutlet: request.From_Location_ID,
            performModule: 9, // Stock Transfer module
            operationType: 1, // Transfer operation
            performRemark: transferRemark,
            operationId: transfer.ID);

        // Log inventory changes for source location
        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.From_Location_ID,
            request.Transfer_Quantity * -1,
            request.Transfer_Quantity * -1,
            transfer.ID);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.To_Location_ID,
            request.Transfer_Quantity,
            request.Transfer_Quantity,
            transfer.ID);

        _logger.LogInformation(
            "Stock transferred: Item {ItemID}, Qty {Qty}, From {FromLocation} to {ToLocation}",
            request.Item_ID, request.Transfer_Quantity, request.From_Location_ID, request.To_Location_ID);

        return _mapper.Map<InventoryDto>(toInventory);
    }
}
