using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<PurchaseOrderService> _logger;

    public PurchaseOrderService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PurchaseOrderService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PurchaseOrderDetailDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequestDto request)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(request.Vendor_ID);
        if (vendor == null || vendor.Is_Deleted)
            throw new NotFoundException("Vendor not found");

        var location = await _unitOfWork.Locations.GetByIdAsync(request.Location_ID);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        var po = new PurchaseOrderHeader
        {
            //PO_Reference_No = $"PO-{DateTime.UtcNow:yyyyMMddHHmmss}",
            PO_Reference_No = request.PO_Reference_No,
            Location_ID = request.Location_ID,
            Vendor_ID = request.Vendor_ID,
            Purchase_Date = DateTime.UtcNow.Date,
            Purchase_Time = DateTime.UtcNow.TimeOfDay,
            Status = 0,
            Remark = request.Remark,
            Performed_By = 1,
            Total_Amount = 0
        };

        var createdPO = await _unitOfWork.PurchaseOrders.AddAsync(po);
        await _unitOfWork.SaveAsync();
        decimal totalAmount = 0;

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                var poItem = new PurchaseOrderItem
                {
                    PO_ID = createdPO.ID,
                    Item_ID = item.Item_ID,
                    Order_Quantity = item.Order_Quantity,
                    Unit_Price = item.Unit_Price,
                    Status = 0,
                    Sub_Total = item.Order_Quantity * item.Unit_Price,
                    Received_Quantity = 0
                };
                await _unitOfWork.Context.Set<PurchaseOrderItem>().AddAsync(poItem);
                totalAmount += poItem.Sub_Total;
            }
        }

        createdPO.Total_Amount = totalAmount;
        await _unitOfWork.PurchaseOrders.UpdateAsync(createdPO);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {PONo} created for Vendor {VendorID}", createdPO.ID, request.Vendor_ID);

        var detail = await GetPurchaseOrderByIdAsync(createdPO.ID);
        return detail;
    }

    public async Task<PurchaseOrderDetailDto> GetPurchaseOrderByIdAsync(long id)
    {
        var po = await _unitOfWork.PurchaseOrders.GetWithItemsAsync(id);
        if (po == null || po.Is_Deleted)
            throw new NotFoundException("Purchase Order not found");

        return _mapper.Map<PurchaseOrderDetailDto>(po);
    }

    public async Task<PaginatedResponseDto<PurchaseOrderDto>> GetAllPurchaseOrdersAsync(
        int skip = 0, int take = 10, long? poId = null, string? poRefNo = null,
        long? vendorId = null, int? status = null, string? dateFrom = null, string? dateTo = null)
    {
        var total = await _unitOfWork.PurchaseOrders.CountFilteredAsync(poId, poRefNo, vendorId, status, dateFrom, dateTo);
        var pos = await _unitOfWork.PurchaseOrders.GetFilteredAsync(poId, poRefNo, vendorId, status, dateFrom, dateTo, skip, take);

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<PurchaseOrderDto>
        {
            Data = _mapper.Map<IEnumerable<PurchaseOrderDto>>(pos),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<PurchaseOrderDetailDto> UpdatePurchaseOrderAsync(long id, UpdatePurchaseOrderRequestDto request)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null || po.Is_Deleted)
            throw new NotFoundException("Purchase Order not found");

        po.Status = request.Status;
        po.Remark = request.Remark;
        po.PO_Reference_No = request.PO_Reference_No ?? po.PO_Reference_No;
        po.Purchase_Date = DateTime.SpecifyKind(po.Purchase_Date, DateTimeKind.Utc);

        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {ID} updated", id);

        return await GetPurchaseOrderByIdAsync(id);
    }

    public async Task<PurchaseOrderDetailDto> ConfirmPurchaseOrderAsync(long id)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null || po.Is_Deleted)
            throw new NotFoundException("Purchase Order not found");

        if (po.Status != 0)
            throw new BadRequestException("Only Pending purchase orders can be confirmed");

        var items = await _unitOfWork.Context.Set<PurchaseOrderItem>()
            .Where(i => i.PO_ID == id && !i.Is_Deleted)
            .ToListAsync();

        foreach (var item in items)
        {
            item.Status = 1;
        }

        po.Status = 1;
        po.Purchase_Date = DateTime.SpecifyKind(po.Purchase_Date, DateTimeKind.Utc);
        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        _unitOfWork.Context.Set<PurchaseOrderItem>().UpdateRange(items);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {ID} confirmed", id);

        return await GetPurchaseOrderByIdAsync(id);
    }

    public async Task<PurchaseOrderDetailDto> CancelPurchaseOrderAsync(long id)
    {
        var po = await _unitOfWork.PurchaseOrders.GetWithItemsAsync(id);
        if (po == null || po.Is_Deleted)
            throw new NotFoundException("Purchase Order not found");

        if (po.Status != 0 && po.Status != 1 && po.Status != 2)
            throw new BadRequestException("Purchase orders with Received or Cancelled status cannot be cancelled");

        var items = await _unitOfWork.Context.Set<PurchaseOrderItem>()
            .Where(i => i.PO_ID == id && !i.Is_Deleted)
            .ToListAsync();

        if (po.Status == 2)
        {
            var unreceivedItems = items.Where(i => i.Status != 3).ToList();
            if (unreceivedItems.Any())
                throw new BadRequestException("Cannot cancel partially received PO unless all items are handled");
        }

        po.Status = 4;
        foreach (var item in items)
        {
            item.Status = 4;
        }
        po.Purchase_Date = DateTime.SpecifyKind(po.Purchase_Date, DateTimeKind.Utc);

        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        _unitOfWork.Context.Set<PurchaseOrderItem>().UpdateRange(items);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {ID} cancelled", id);

        return await GetPurchaseOrderByIdAsync(id);
    }

    public async Task DeletePurchaseOrderAsync(long id)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null)
            throw new NotFoundException("Purchase Order not found");

        po.Is_Deleted = true;
        po.Purchase_Date = DateTime.SpecifyKind(po.Purchase_Date, DateTimeKind.Utc);
        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {ID} deleted", id);
    }

    public async Task<PaginatedResponseDto<PurchaseOrderDto>> GetByVendorAsync(long vendorId, int skip = 0, int take = 10)
    {
        var pos = await _unitOfWork.PurchaseOrders.GetByVendorWithDetailsAsync(vendorId, skip, take);
        var total = await _unitOfWork.PurchaseOrders.CountByVendorAsync(vendorId);
        var activePOs = pos.Where(p => !p.Is_Deleted).ToList();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<PurchaseOrderDto>
        {
            Data = _mapper.Map<IEnumerable<PurchaseOrderDto>>(activePOs),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<PurchaseOrderDetailDto> AddItemToPurchaseOrderAsync(long id, AddPurchaseOrderItemRequestDto request)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null || po.Is_Deleted)
            throw new NotFoundException("Purchase Order not found");

        // Only allow adding items when PO status is Saved (0)
        if (po.Status != 0)
            throw new BadRequestException("Items can only be added to Saved purchase orders");

        // Verify item exists
        var item = await _unitOfWork.Items.GetByIdAsync(request.Item_ID);
        if (item == null || item.Is_Deleted)
            throw new NotFoundException("Item not found");

        // Check if item already exists in PO
        var existingItem = await _unitOfWork.Context.Set<PurchaseOrderItem>()
            .FirstOrDefaultAsync(p => p.PO_ID == id && p.Item_ID == request.Item_ID && !p.Is_Deleted);
        if (existingItem != null)
            throw new BadRequestException("This item is already in the purchase order");

        // Validate quantities and prices
        if (request.Order_Quantity <= 0)
            throw new BadRequestException("Order quantity must be greater than zero");
        if (request.Unit_Price <= 0)
            throw new BadRequestException("Unit price must be greater than zero");

        // Create new PO item
        var poItem = new PurchaseOrderItem
        {
            PO_ID = id,
            Item_ID = request.Item_ID,
            Order_Quantity = request.Order_Quantity,
            Unit_Price = request.Unit_Price,
            Status = 0,
            Sub_Total = request.Order_Quantity * request.Unit_Price,
            Received_Quantity = 0
        };

        await _unitOfWork.Context.Set<PurchaseOrderItem>().AddAsync(poItem);

        // Update PO total amount
        po.Total_Amount += poItem.Sub_Total;
        po.Purchase_Date = DateTime.SpecifyKind(po.Purchase_Date, DateTimeKind.Utc);
        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Item {ItemID} added to Purchase Order {POID}", request.Item_ID, id);

        return await GetPurchaseOrderByIdAsync(id);
    }

    public async Task<PurchaseOrderDetailDto> RemoveItemFromPurchaseOrderAsync(long id, long itemId)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null || po.Is_Deleted)
            throw new NotFoundException("Purchase Order not found");

        // Only allow removing items when PO status is Saved (0)
        if (po.Status != 0)
            throw new BadRequestException("Items can only be removed from Saved purchase orders");

        var poItem = await _unitOfWork.Context.Set<PurchaseOrderItem>()
            .FirstOrDefaultAsync(p => p.ID == itemId && p.PO_ID == id && !p.Is_Deleted);
        if (poItem == null)
            throw new NotFoundException("Purchase Order item not found");

        // Mark item as deleted and update PO total
        poItem.Is_Deleted = true;
        po.Total_Amount -= poItem.Sub_Total;

        _unitOfWork.Context.Set<PurchaseOrderItem>().Update(poItem);
        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Item {ItemID} removed from Purchase Order {POID}", itemId, id);

        return await GetPurchaseOrderByIdAsync(id);
    }
}
