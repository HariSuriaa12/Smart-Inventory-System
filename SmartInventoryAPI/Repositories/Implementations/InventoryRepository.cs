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
            .FirstOrDefaultAsync(i => i.ItemID == itemId && i.LocationID == locationId && !i.IsDeleted);
    }

    public async Task<IEnumerable<Inventory>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.LocationID == locationId && !i.IsDeleted)
            .Include(i => i.Item)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Inventory>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.ItemID == itemId && !i.IsDeleted)
            .Include(i => i.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalAvailableQuantityAsync(long itemId)
    {
        return await _dbSet.Where(i => i.ItemID == itemId && !i.IsDeleted)
            .SumAsync(i => i.AvailableQuantity);
    }
}
