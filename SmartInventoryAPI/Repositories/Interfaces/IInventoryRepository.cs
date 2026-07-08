using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IInventoryRepository : IGenericRepository<Inventory>
{
    Task<Inventory?> GetByItemAndLocationAsync(long itemId, long locationId);
    Task<IEnumerable<Inventory>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<Inventory>> GetByItemAsync(long itemId, int skip = 0, int take = 10);
    Task<decimal> GetTotalAvailableQuantityAsync(long itemId);
}
