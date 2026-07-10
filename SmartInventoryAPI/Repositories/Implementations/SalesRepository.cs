using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class SalesRepository : GenericRepository<Sales>, ISalesRepository
{
    public SalesRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Sales?> GetWithItemsAsync(long id)
    {
        return await _dbSet.Include(s => s.Items)
            .ThenInclude(i => i.Item)
            .Include(s => s.Location)
            .FirstOrDefaultAsync(s => s.ID == id && !s.Is_Deleted);
    }

    public async Task<IEnumerable<Sales>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Location_ID == locationId && !s.Is_Deleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Sales_Date >= startDate && s.Sales_Date <= endDate && !s.Is_Deleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Sales_Status == status && !s.Is_Deleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
