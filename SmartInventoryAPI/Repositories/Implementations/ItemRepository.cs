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
        return await _dbSet.FirstOrDefaultAsync(i => i.Item_Code == itemCode && !i.Is_Deleted);
    }

    public async Task<IEnumerable<Item>> GetByCategoryAsync(string category, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.Item_Category == category && !i.Is_Deleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountByCategoryAsync(string category)
    {
        return await _dbSet.Where(i => i.Item_Category == category && !i.Is_Deleted)
            .CountAsync();
    }

    public async Task<IEnumerable<Item>> GetActiveItemsAsync(int skip = 0, int take = 10)
    {
        return await _dbSet.Where(i => i.Is_Active && !i.Is_Deleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> SearchAsync(string? searchQuery, int skip = 0, int take = 10)
    {
        var query = _dbSet.Where(i => !i.Is_Deleted);

        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var lowerQuery = searchQuery.ToLower().Trim();
            query = query.Where(i =>
                i.Item_Code.ToLower().Contains(lowerQuery) ||
                i.Item_Name.ToLower().Contains(lowerQuery) ||
                (i.Item_Brand != null && i.Item_Brand.ToLower().Contains(lowerQuery)) ||
                (i.Description != null && i.Description.ToLower().Contains(lowerQuery)));
        }

        return await query
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountSearchAsync(string? searchQuery)
    {
        var query = _dbSet.Where(i => !i.Is_Deleted);

        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var lowerQuery = searchQuery.ToLower().Trim();
            query = query.Where(i =>
                i.Item_Code.ToLower().Contains(lowerQuery) ||
                i.Item_Name.ToLower().Contains(lowerQuery) ||
                (i.Item_Brand != null && i.Item_Brand.ToLower().Contains(lowerQuery)) ||
                (i.Description != null && i.Description.ToLower().Contains(lowerQuery)));
        }

        return await query.CountAsync();
    }
}
