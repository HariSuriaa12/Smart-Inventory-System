using SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IOrderFulfillmentService
{
    Task<OrderFulfillmentDetailDto> ReceiveOrderFulfillmentAsync(ReceiveOrderFulfillmentRequestDto request);
    Task<OrderFulfillmentDetailDto> GetOrderFulfillmentByIdAsync(long id);
    Task<PaginatedResponseDto<OrderFulfillmentDto>> GetAllOrderFulfillmentsAsync(int skip = 0, int take = 10, long? fulfillmentId = null, long? customerId = null, int? status = null, bool? unprocessedOnly = null, long? locationId = null);
    Task<OrderFulfillmentDetailDto> UpdateOrderFulfillmentAsync(long id, UpdateOrderFulfillmentRequestDto request);
    Task<OrderFulfillmentDetailDto> VerifyAndAssignAsync(long id, long locationId);
    Task<OrderFulfillmentDetailDto> ShipItemAsync(long id, long itemId, decimal shippedQuantity);
    Task<OrderFulfillmentDetailDto> CancelItemAsync(long id, long itemId);
    Task<OrderFulfillmentDetailDto> CancelItemWithReturnAsync(long id, long itemId);
    Task DeleteOrderFulfillmentAsync(long id);
    Task<PaginatedResponseDto<OrderFulfillmentDto>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10);
}
