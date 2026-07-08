using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class StockTransferRepository : GenericRepository<StockTransfer>, IStockTransferRepository
{
    public StockTransferRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<StockTransfer>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.FromLocationID == locationId && !s.IsDeleted)
            .Include(s => s.Item)
            .Include(s => s.FromLocation)
            .Include(s => s.ToLocation)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.ToLocationID == locationId && !s.IsDeleted)
            .Include(s => s.Item)
            .Include(s => s.FromLocation)
            .Include(s => s.ToLocation)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Status == status && !s.IsDeleted)
            .Include(s => s.Item)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.ItemID == itemId && !s.IsDeleted)
            .Include(s => s.FromLocation)
            .Include(s => s.ToLocation)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
