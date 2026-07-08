using SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IOrderFulfillmentService
{
    Task<OrderFulfillmentDetailDto> ReceiveOrderFulfillmentAsync(ReceiveOrderFulfillmentRequestDto request);
    Task<OrderFulfillmentDetailDto> GetOrderFulfillmentByIdAsync(long id);
    Task<IEnumerable<OrderFulfillmentDto>> GetAllOrderFulfillmentsAsync(int skip = 0, int take = 10);
    Task<OrderFulfillmentDetailDto> UpdateOrderFulfillmentAsync(long id, UpdateOrderFulfillmentRequestDto request);
    Task DeleteOrderFulfillmentAsync(long id);
    Task<IEnumerable<OrderFulfillmentDto>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10);
}
