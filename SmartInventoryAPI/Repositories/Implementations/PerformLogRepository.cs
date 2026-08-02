using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class PerformLogRepository : GenericRepository<PerformLog>, IPerformLogRepository
{
    public PerformLogRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<PerformLog>> GetPerformedLogs(int skip = 0, int take = 10)
    {
        return await _dbSet
            .Include(o => o.Location)
            .Include(u => u.User)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
