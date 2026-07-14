using SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IPurchaseOrderService
{
    Task<PurchaseOrderDetailDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequestDto request);
    Task<PurchaseOrderDetailDto> GetPurchaseOrderByIdAsync(long id);
    Task<PaginatedResponseDto<PurchaseOrderDto>> GetAllPurchaseOrdersAsync(int skip = 0, int take = 10, long? poId = null, string? poRefNo = null, long? vendorId = null, int? status = null, string? dateFrom = null, string? dateTo = null);
    Task<PurchaseOrderDetailDto> UpdatePurchaseOrderAsync(long id, UpdatePurchaseOrderRequestDto request);
    Task<PurchaseOrderDetailDto> ConfirmPurchaseOrderAsync(long id);
    Task<PurchaseOrderDetailDto> CancelPurchaseOrderAsync(long id);
    Task DeletePurchaseOrderAsync(long id);
    Task<PaginatedResponseDto<PurchaseOrderDto>> GetByVendorAsync(long vendorId, int skip = 0, int take = 10);
    Task<PurchaseOrderDetailDto> AddItemToPurchaseOrderAsync(long id, AddPurchaseOrderItemRequestDto request);
    Task<PurchaseOrderDetailDto> RemoveItemFromPurchaseOrderAsync(long id, long itemId);
    Task<PurchaseOrderDetailDto> ReceiveItemAsync(long id, long itemId, decimal receivedQuantity);
    Task<PurchaseOrderDetailDto> CancelItemAsync(long id, long itemId);
    Task<PurchaseOrderDetailDto> CancelItemWithReturnAsync(long id, long itemId);
}
