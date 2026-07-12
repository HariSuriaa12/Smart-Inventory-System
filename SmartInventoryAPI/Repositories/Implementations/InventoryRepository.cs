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
        var inventory = await _dbSet
            .FirstOrDefaultAsync(i => i.Item_ID == itemId && i.Location_ID == locationId && !i.Is_Deleted);

        if (inventory != null)
        {
            inventory.Item = await _context.Set<Item>().FirstOrDefaultAsync(x => x.ID == itemId);
            inventory.Location = await _context.Set<Location>().FirstOrDefaultAsync(x => x.ID == locationId);
        }

        return inventory;
    }

    public async Task<IEnumerable<Inventory>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var inventories = await _dbSet
            .Where(i => i.Location_ID == locationId && !i.Is_Deleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        // Manually load related entities to avoid include issues
        var itemIds = inventories.Select(i => i.Item_ID).Distinct().ToList();
        var items = await _context.Set<Item>()
            .Where(x => itemIds.Contains(x.ID))
            .ToListAsync();

        var locations = await _context.Set<Location>()
            .Where(x => x.ID == locationId)
            .ToListAsync();

        foreach (var inv in inventories)
        {
            inv.Item = items.FirstOrDefault(x => x.ID == inv.Item_ID);
            inv.Location = locations.FirstOrDefault(x => x.ID == inv.Location_ID);
        }

        return inventories;
    }

    public async Task<IEnumerable<Inventory>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        var inventories = await _dbSet
            .Where(i => i.Item_ID == itemId && !i.Is_Deleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        // Manually load related entities
        var locationIds = inventories.Select(i => i.Location_ID).Distinct().ToList();
        var locations = await _context.Set<Location>()
            .Where(x => locationIds.Contains(x.ID))
            .ToListAsync();

        var items = await _context.Set<Item>()
            .Where(x => x.ID == itemId)
            .ToListAsync();

        foreach (var inv in inventories)
        {
            inv.Item = items.FirstOrDefault(x => x.ID == inv.Item_ID);
            inv.Location = locations.FirstOrDefault(x => x.ID == inv.Location_ID);
        }

        return inventories;
    }

    public async Task<decimal> GetTotalAvailableQuantityAsync(long itemId)
    {
        return await _dbSet.Where(i => i.Item_ID == itemId && !i.Is_Deleted)
            .SumAsync(i => i.Available_Quantity);
    }

    public async Task<int> CountByLocationAsync(long locationId)
    {
        return await _dbSet.Where(i => i.Location_ID == locationId && !i.Is_Deleted)
            .CountAsync();
    }

    public async Task<int> CountByItemAsync(long itemId)
    {
        return await _dbSet.Where(i => i.Item_ID == itemId && !i.Is_Deleted)
            .CountAsync();
    }
}
