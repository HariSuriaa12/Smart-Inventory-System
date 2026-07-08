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
        if (inventory == null || inventory.IsDeleted)
            throw new NotFoundException("Inventory not found");

        return _mapper.Map<InventoryDto>(inventory);
    }

    public async Task<IEnumerable<InventoryDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var inventories = await _unitOfWork.Inventories.GetByLocationAsync(locationId, skip, take);
        return _mapper.Map<IEnumerable<InventoryDto>>(inventories);
    }

    public async Task<IEnumerable<InventoryDto>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        var inventories = await _unitOfWork.Inventories.GetByItemAsync(itemId, skip, take);
        return _mapper.Map<IEnumerable<InventoryDto>>(inventories);
    }

    public async Task<InventoryDto> AdjustInventoryAsync(AdjustInventoryRequestDto request)
    {
        var inventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.ItemID, request.LocationID);
        if (inventory == null || inventory.IsDeleted)
            throw new NotFoundException("Inventory record not found");

        var previousOnhand = inventory.OnHandQuantity;
        var previousAvailable = inventory.AvailableQuantity;

        inventory.OnHandQuantity += request.QuantityAdjustment;
        inventory.AvailableQuantity += request.QuantityAdjustment;

        await _unitOfWork.Inventories.UpdateAsync(inventory);
        await _unitOfWork.SaveAsync();

        // Log inventory adjustment
        await _loggingService.LogPerformanceAsync(
            performedBy: 1,
            performedOutlet: request.LocationID,
            performModule: 2, // Inventory module
            operationType: 2, // Update operation
            performRemark: $"Stock adjustment: {request.Remark}",
            operationId: inventory.ID);

        await _loggingService.LogInventoryChangeAsync(
            request.ItemID,
            request.LocationID,
            previousOnhand,
            inventory.OnHandQuantity,
            previousAvailable,
            inventory.AvailableQuantity,
            inventory.ID);

        _logger.LogInformation(
            "Inventory adjusted: Item {ItemID}, Location {LocationID}, Qty: {PreviousQty} -> {NewQty}",
            request.ItemID, request.LocationID, previousOnhand, inventory.OnHandQuantity);

        return _mapper.Map<InventoryDto>(inventory);
    }

    public async Task<InventoryDto> StockTransferAsync(StockTransferRequestDto request)
    {
        var fromInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.ItemID, request.FromLocationID);
        if (fromInventory == null || fromInventory.IsDeleted)
            throw new NotFoundException("Source inventory not found");

        if (fromInventory.AvailableQuantity < request.TransferQuantity)
            throw new BadRequestException("Insufficient stock for transfer");

        var toInventory = await _unitOfWork.Inventories.GetByItemAndLocationAsync(request.ItemID, request.ToLocationID);
        if (toInventory == null || toInventory.IsDeleted)
            throw new NotFoundException("Destination inventory not found");

        // Store previous values for logging
        var fromPreviousOnhand = fromInventory.OnHandQuantity;
        var fromPreviousAvailable = fromInventory.AvailableQuantity;
        var toPreviousOnhand = toInventory.OnHandQuantity;
        var toPreviousAvailable = toInventory.AvailableQuantity;

        // Deduct from source
        fromInventory.AvailableQuantity -= request.TransferQuantity;
        await _unitOfWork.Inventories.UpdateAsync(fromInventory);

        // Add to destination
        toInventory.OnHandQuantity += request.TransferQuantity;
        toInventory.AvailableQuantity += request.TransferQuantity;
        await _unitOfWork.Inventories.UpdateAsync(toInventory);

        // Create transfer record
        var transfer = new StockTransfer
        {
            FromLocationID = request.FromLocationID,
            ToLocationID = request.ToLocationID,
            ItemID = request.ItemID,
            TransferQuantity = request.TransferQuantity,
            Remark = request.Remark,
            Status = 1,
            TransferDate = DateTime.UtcNow.Date,
            TransferTime = DateTime.UtcNow.TimeOfDay,
            SubTotal = 0
        };

        await _unitOfWork.StockTransfers.AddAsync(transfer);
        await _unitOfWork.SaveAsync();

        // Log performance
        await _loggingService.LogPerformanceAsync(
            performedBy: 1,
            performedOutlet: request.FromLocationID,
            performModule: 2, // Inventory module
            operationType: 4, // Transfer operation
            performRemark: $"Stock transfer: {request.TransferQuantity} units from Location {request.FromLocationID} to {request.ToLocationID}",
            operationId: transfer.ID);

        // Log inventory changes for source location
        await _loggingService.LogInventoryChangeAsync(
            request.ItemID,
            request.FromLocationID,
            fromPreviousOnhand,
            fromInventory.OnHandQuantity,
            fromPreviousAvailable,
            fromInventory.AvailableQuantity,
            transfer.ID);

        // Log inventory changes for destination location
        await _loggingService.LogInventoryChangeAsync(
            request.ItemID,
            request.ToLocationID,
            toPreviousOnhand,
            toInventory.OnHandQuantity,
            toPreviousAvailable,
            toInventory.AvailableQuantity,
            transfer.ID);

        _logger.LogInformation(
            "Stock transferred: Item {ItemID}, Qty {Qty}, From {FromLocation} to {ToLocation}",
            request.ItemID, request.TransferQuantity, request.FromLocationID, request.ToLocationID);

        return _mapper.Map<InventoryDto>(toInventory);
    }
}
