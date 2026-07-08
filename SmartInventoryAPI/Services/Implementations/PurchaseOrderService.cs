using AutoMapper;
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
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(request.VendorID);
        if (vendor == null || vendor.IsDeleted)
            throw new NotFoundException("Vendor not found");

        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationID);
        if (location == null || location.IsDeleted)
            throw new NotFoundException("Location not found");

        var po = new PurchaseOrderHeader
        {
            PORefenceNo = $"PO-{DateTime.UtcNow:yyyyMMddHHmmss}",
            LocationID = request.LocationID,
            VendorID = request.VendorID,
            PurchaseDate = DateTime.UtcNow.Date,
            PurchaseTime = DateTime.UtcNow.TimeOfDay,
            Status = 1,
            Remark = request.Remark,
            PerformedBy = 1,
            TotalAmount = 0
        };

        var createdPO = await _unitOfWork.PurchaseOrders.AddAsync(po);
        decimal totalAmount = 0;

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                var poItem = new PurchaseOrderItem
                {
                    POID = createdPO.ID,
                    ItemID = item.ItemID,
                    OrderQuantity = item.OrderQuantity,
                    UnitPrice = item.UnitPrice,
                    Status = 1,
                    SubTotal = item.OrderQuantity * item.UnitPrice,
                    ReceivedQuantity = 0
                };
                await _unitOfWork.PurchaseOrders.AddAsync(createdPO);
                totalAmount += poItem.SubTotal;
            }
        }

        createdPO.TotalAmount = totalAmount;
        await _unitOfWork.PurchaseOrders.UpdateAsync(createdPO);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {PONo} created for Vendor {VendorID}", createdPO.PORefenceNo, request.VendorID);

        var detail = await GetPurchaseOrderByIdAsync(createdPO.ID);
        return detail;
    }

    public async Task<PurchaseOrderDetailDto> GetPurchaseOrderByIdAsync(long id)
    {
        var po = await _unitOfWork.PurchaseOrders.GetWithItemsAsync(id);
        if (po == null || po.IsDeleted)
            throw new NotFoundException("Purchase Order not found");

        return _mapper.Map<PurchaseOrderDetailDto>(po);
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetAllPurchaseOrdersAsync(int skip = 0, int take = 10)
    {
        var pos = await _unitOfWork.PurchaseOrders.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<PurchaseOrderDto>>(pos.Where(p => !p.IsDeleted));
    }

    public async Task<PurchaseOrderDetailDto> UpdatePurchaseOrderAsync(long id, UpdatePurchaseOrderRequestDto request)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null || po.IsDeleted)
            throw new NotFoundException("Purchase Order not found");

        po.Status = request.Status;
        po.Remark = request.Remark;

        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {ID} updated", id);

        return await GetPurchaseOrderByIdAsync(id);
    }

    public async Task DeletePurchaseOrderAsync(long id)
    {
        var po = await _unitOfWork.PurchaseOrders.GetByIdAsync(id);
        if (po == null)
            throw new NotFoundException("Purchase Order not found");

        po.IsDeleted = true;
        await _unitOfWork.PurchaseOrders.UpdateAsync(po);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Purchase Order {ID} deleted", id);
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetByVendorAsync(long vendorId, int skip = 0, int take = 10)
    {
        var pos = await _unitOfWork.PurchaseOrders.GetByVendorAsync(vendorId, skip, take);
        return _mapper.Map<IEnumerable<PurchaseOrderDto>>(pos);
    }
}
