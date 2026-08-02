using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class PriceLogRepository : GenericRepository<PriceLog>, IPriceLogRepository
{
    public PriceLogRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<PriceLog>> GetPriceLogs(int skip = 0, int take = 10)
    {
        return await _dbSet
            .Include(i => i.Item)
            .Include(p => p.PerformLog)
            .ThenInclude(u => u.User)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
