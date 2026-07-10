using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class InventoryRepository : GenericRepository<Inventory>, IInventoryRepository
{
    public InventoryRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Inventory?> GetByItemAndLocationAsync(long itemId, long locationId)
    {
        return await _dbSet.Include(i => i.Item)
            .Include(i => i.Location)
            .FirstOrDefaultAsync(i => i.Item_ID == itemId && i.Location_ID == locationId && !i.Is_Deleted);
    }

    public async Task<IEnumerable<Inventory>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.Location_ID == locationId && !i.Is_Deleted)
            .Include(i => i.Item)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Inventory>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.Item_ID == itemId && !i.Is_Deleted)
            .Include(i => i.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalAvailableQuantityAsync(long itemId)
    {
        return await _dbSet.Where(i => i.Item_ID == itemId && !i.Is_Deleted)
            .SumAsync(i => i.Available_Quantity);
    }
}
