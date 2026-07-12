using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<InventoryService> _logger;
    private readonly ILoggingService _loggingService;

    public InventoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<InventoryService> logger, ILoggingService loggingService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _loggingService = loggingService;
    }

    public async Task<InventoryDto> GetInventoryByIdAsync(long id)
    {
        var inventory = await _unitOfWork.Inventories.GetByIdAsync(id);
        if (inventory == null || inventory.Is_Deleted)
            throw new NotFoundException("Inventory not found");

        return _mapper.Map<InventoryDto>(inventory);
    }

    public async Task<IEnumerable<InventoryDetailDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var inventories = await _unitOfWork.Inventories.GetByLocationAsync(locationId, skip, take);
        return _mapper.Map<IEnumerable<InventoryDetailDto>>(inventories);
    }

    public async Task<IEnumerable<InventoryDetailDto>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        var inventories = await _unitOfWork.Inventories.GetByItemAsync(itemId, skip, take);
        return _mapper.Map<IEnumerable<InventoryDetailDto>>(inventories);
    }

    public async Task<InventoryDto> AdjustInventoryAsync(AdjustInventoryRequestDto request)
    {
        var inventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.Item_ID, request.Location_ID);
        if (inventory == null || inventory.Is_Deleted)
            throw new NotFoundException("Inventory record not found");

        var previousOnhand = inventory.On_Hand_Quantity;
        var previousAvailable = inventory.Available_Quantity;

        inventory.On_Hand_Quantity += request.QuantityAdjustment;
        inventory.Available_Quantity += request.QuantityAdjustment;

        await _unitOfWork.Inventories.UpdateAsync(inventory);
        await _unitOfWork.SaveAsync();

        // Log inventory adjustment
        var adjustRemark = string.IsNullOrEmpty(request.Remark)
            ? "Stock Adjust : "
            : $"Stock Adjust : {request.Remark}";

        await _loggingService.LogPerformanceAsync(
            performedBy: 1,
            performedOutlet: request.Location_ID,
            performModule: 2, // Inventory module
            operationType: 2, // Update operation
            performRemark: adjustRemark,
            operationId: inventory.ID);

        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.Location_ID,
            previousOnhand,
            inventory.On_Hand_Quantity,
            previousAvailable,
            inventory.Available_Quantity,
            inventory.ID);

        _logger.LogInformation(
            "Inventory adjusted: Item {ItemID}, Location {LocationID}, Qty: {PreviousQty} -> {NewQty}",
            request.Item_ID, request.Location_ID, previousOnhand, inventory.On_Hand_Quantity);

        return _mapper.Map<InventoryDto>(inventory);
    }

    public async Task<InventoryDto> StockTransferAsync(StockTransferRequestDto request)
    {
        var fromInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.Item_ID, request.From_Location_ID);
        if (fromInventory == null || fromInventory.Is_Deleted)
            throw new NotFoundException("Source inventory not found");

        if (fromInventory.Available_Quantity < request.Transfer_Quantity)
            throw new BadRequestException("Insufficient stock for transfer");

        var toInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.Item_ID, request.To_Location_ID);
        if (toInventory == null || toInventory.Is_Deleted)
            throw new NotFoundException("Destination inventory not found");

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
        toInventory.Available_Quantity += request.Transfer_Quantity;
        await _unitOfWork.Inventories.UpdateAsync(toInventory);

        // Create transfer record
        var transfer = new StockTransfer
        {
            From_Location_ID = request.From_Location_ID,
            To_Location_ID = request.To_Location_ID,
            Item_ID = request.Item_ID,
            Transfer_Quantity = request.Transfer_Quantity,
            Remark = request.Remark,
            Status = 1,
            Transfer_Date = DateTime.UtcNow.Date,
            Transfer_Time = DateTime.UtcNow.TimeOfDay,
            Sub_Total = 0
        };

        await _unitOfWork.StockTransfers.AddAsync(transfer);
        await _unitOfWork.SaveAsync();

        // Log performance
        var transferRemark = string.IsNullOrEmpty(request.Remark)
            ? "Stock Transfer : "
            : $"Stock Transfer : {request.Remark}";

        await _loggingService.LogPerformanceAsync(
            performedBy: 1,
            performedOutlet: request.From_Location_ID,
            performModule: 2, // Inventory module
            operationType: 4, // Transfer operation
            performRemark: transferRemark,
            operationId: transfer.ID);

        // Log inventory changes for source location
        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.From_Location_ID,
            fromPreviousOnhand,
            fromInventory.On_Hand_Quantity,
            fromPreviousAvailable,
            fromInventory.Available_Quantity,
            transfer.ID);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.To_Location_ID,
            toPreviousOnhand,
            toInventory.On_Hand_Quantity,
            toPreviousAvailable,
            toInventory.Available_Quantity,
            transfer.ID);

        _logger.LogInformation(
            "Stock transferred: Item {ItemID}, Qty {Qty}, From {FromLocation} to {ToLocation}",
            request.Item_ID, request.Transfer_Quantity, request.From_Location_ID, request.To_Location_ID);

        return _mapper.Map<InventoryDto>(toInventory);
    }
}
