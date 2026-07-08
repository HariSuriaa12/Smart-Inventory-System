using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class ItemRepository : GenericRepository<Item>, IItemRepository
{
    public ItemRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Item?> GetByItemCodeAsync(string itemCode)
    {
        return await _dbSet.FirstOrDefaultAsync(i => i.ItemCode == itemCode && !i.IsDeleted);
    }

    public async Task<IEnumerable<Item>> GetByCategoryAsync(string category, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.ItemCategory == category && !i.IsDeleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> GetActiveItemsAsync(int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.IsActive && !i.IsDeleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
