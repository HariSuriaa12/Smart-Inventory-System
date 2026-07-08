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
            .FirstOrDefaultAsync(s => s.ID == id && !s.IsDeleted);
    }

    public async Task<IEnumerable<Sales>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.LocationID == locationId && !s.IsDeleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.SalesDate >= startDate && s.SalesDate <= endDate && !s.IsDeleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.SalesStatus == status && !s.IsDeleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
