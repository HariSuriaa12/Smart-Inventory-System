using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IItemRepository : IGenericRepository<Item>
{
    Task<Item?> GetByItemCodeAsync(string itemCode);
    Task<IEnumerable<Item>> GetByCategoryAsync(string category, int skip = 0, int take = 10);
    Task<int> CountByCategoryAsync(string category);
    Task<IEnumerable<Item>> GetActiveItemsAsync(int skip = 0, int take = 10);
}
