using SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IPurchaseOrderService
{
    Task<PurchaseOrderDetailDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequestDto request);
    Task<PurchaseOrderDetailDto> GetPurchaseOrderByIdAsync(long id);
    Task<IEnumerable<PurchaseOrderDto>> GetAllPurchaseOrdersAsync(int skip = 0, int take = 10);
    Task<PurchaseOrderDetailDto> UpdatePurchaseOrderAsync(long id, UpdatePurchaseOrderRequestDto request);
    Task DeletePurchaseOrderAsync(long id);
    Task<IEnumerable<PurchaseOrderDto>> GetByVendorAsync(long vendorId, int skip = 0, int take = 10);
    Task<PurchaseOrderDetailDto> AddItemToPurchaseOrderAsync(long id, AddPurchaseOrderItemRequestDto request);
    Task<PurchaseOrderDetailDto> RemoveItemFromPurchaseOrderAsync(long id, long itemId);
}
