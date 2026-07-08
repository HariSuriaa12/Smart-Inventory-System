using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IOrderFulfillmentRepository : IGenericRepository<OrderFulfillmentHeader>
{
    Task<OrderFulfillmentHeader?> GetWithItemsAsync(long id);
    Task<IEnumerable<OrderFulfillmentHeader>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10);
    Task<IEnumerable<OrderFulfillmentHeader>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<OrderFulfillmentHeader>> GetByStatusAsync(int status, int skip = 0, int take = 10);
}
