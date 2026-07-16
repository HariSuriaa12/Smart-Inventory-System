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

    public async Task<PaginatedResponseDto<InventoryDetailDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10, string? searchQuery = null)
    {
        var inventories = await _unitOfWork.Inventories.GetByLocationAsync(locationId, skip, take);
        var total = await _unitOfWork.Inventories.CountByLocationAsync(locationId);

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var searchLower = searchQuery.ToLower();
            inventories = inventories.Where(i =>
                (i.Item?.Item_Name?.ToLower().Contains(searchLower) ?? false) ||
                (i.Item?.Item_Code?.ToLower().Contains(searchLower) ?? false) ||
                (i.Item?.Item_Category?.ToLower().Contains(searchLower) ?? false) ||
                (i.Item?.Item_Brand?.ToLower().Contains(searchLower) ?? false)
            ).ToList();

            total = inventories.Count();
            inventories = inventories.Skip(skip).Take(take).ToList();
        }

        var page = (skip / take) + 1;
        var totalPages = (total + take - 1) / take;

        return new PaginatedResponseDto<InventoryDetailDto>
        {
            Data = _mapper.Map<IEnumerable<InventoryDetailDto>>(inventories),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }

    public async Task<PaginatedResponseDto<InventoryDetailDto>> GetByItemAsync(long itemId, int skip = 0, int take = 10, string? searchQuery = null)
    {
        var inventories = await _unitOfWork.Inventories.GetByItemAsync(itemId, skip, take);
        var total = await _unitOfWork.Inventories.CountByItemAsync(itemId);

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var searchLower = searchQuery.ToLower();
            inventories = inventories.Where(i =>
                (i.Item?.Item_Name?.ToLower().Contains(searchLower) ?? false) ||
                (i.Item?.Item_Code?.ToLower().Contains(searchLower) ?? false) ||
                (i.Item?.Item_Category?.ToLower().Contains(searchLower) ?? false) ||
                (i.Item?.Item_Brand?.ToLower().Contains(searchLower) ?? false)
            ).ToList();

            total = inventories.Count();
            inventories = inventories.Skip(skip).Take(take).ToList();
        }

        var page = (skip / take) + 1;
        var totalPages = (total + take - 1) / take;

        return new PaginatedResponseDto<InventoryDetailDto>
        {
            Data = _mapper.Map<IEnumerable<InventoryDetailDto>>(inventories),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }

    public async Task<InventoryDetailDto> GetByItemAndLocationAsync(long itemId, long locationId)
    {
        var item = await _unitOfWork.Inventories.GetByIdAsync(itemId);
        if (item == null || item.Is_Deleted == true)
            throw new Exception("item not found");

        var location = await _unitOfWork.Inventories.GetByIdAsync(locationId);
        if (location == null || location.Is_Deleted == true)
            throw new Exception("location not found");

        var inventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(item.ID, location.ID);
        if (inventory == null || inventory.Is_Deleted == true)
            throw new Exception("Inventory not found");

        return _mapper.Map<InventoryDetailDto>(inventory);
    }

    public async Task<InventoryDto> AdjustInventoryAsync(AdjustInventoryRequestDto request, long userId = 1)
    {
        var inventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.Item_ID, request.Location_ID);
        if (inventory == null || inventory.Is_Deleted)
            throw new NotFoundException("Inventory record not found");

        inventory.On_Hand_Quantity += request.QuantityAdjustment;
        inventory.Available_Quantity += request.QuantityAdjustment;

        await _unitOfWork.Inventories.UpdateAsync(inventory);
        await _unitOfWork.SaveAsync();

        // Log inventory adjustment
        var adjustRemark = string.IsNullOrEmpty(request.Remark)
            ? "Stock Adjust : "
            : $"Stock Adjust : {request.Remark}";

        await _loggingService.LogPerformanceAsync(
            performedBy: userId,
            performedOutlet: request.Location_ID,
            performModule: 2, // Inventory module
            operationType: 2, // Update operation
            performRemark: adjustRemark,
            operationId: inventory.ID);

        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.Location_ID,
            inventory.On_Hand_Quantity,
            inventory.Available_Quantity,
            inventory.ID);

        _logger.LogInformation(
            "Inventory adjusted: Item {ItemID}, Location {LocationID}, Qty Onhand: {Onhand}, Available Onhand: {Av}",
            request.Item_ID, request.Location_ID, inventory.On_Hand_Quantity, inventory.Available_Quantity);

        return _mapper.Map<InventoryDto>(inventory);
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

        // Deduct from source
        fromInventory.Available_Quantity -= request.Transfer_Quantity;
        fromInventory.On_Hand_Quantity -= request.Transfer_Quantity;
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
            performModule: 2, // Inventory module
            operationType: 4, // Transfer operation
            performRemark: transferRemark,
            operationId: transfer.ID);

        // Log inventory changes for source location
        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.From_Location_ID,
            fromInventory.On_Hand_Quantity,
            fromInventory.Available_Quantity,
            transfer.ID);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            request.Item_ID,
            request.To_Location_ID,
            toInventory.On_Hand_Quantity,
            0,
            transfer.ID);

        _logger.LogInformation(
            "Stock transferred: Item {ItemID}, Qty {Qty}, From {FromLocation} to {ToLocation}",
            request.Item_ID, request.Transfer_Quantity, request.From_Location_ID, request.To_Location_ID);

        return _mapper.Map<InventoryDto>(toInventory);
    }

    public async Task<IEnumerable<dynamic>> GetInventoryTrendAsync(long locationId)
    {
        var inventories = await _unitOfWork.Inventories.GetByLocationAsync(locationId, 0, 1000);

        var totalValue = inventories.Sum(i => (i.On_Hand_Quantity * (i.Item?.Unit_Price ?? 0)));
        var baseValue = totalValue / 6;

        var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun" };
        var trend = months.Select((month, idx) =>
        {
            var variance = 0.8 + (idx * 0.08);
            return new
            {
                month = month,
                value = (int)(baseValue * variance),
                items = inventories.Count()
            };
        }).ToList<dynamic>();

        return trend;
    }
}
