using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class InventoryLogRepository : GenericRepository<InventoryLog>, IInventoryLogRepository
{
    public InventoryLogRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<InventoryLog>> GetInventoryLogs(int skip = 0, int take = 10)
    {
        return await _dbSet
            .Include(o => o.Location)
            .Include(i => i.Item)
            .Include(p => p.PerformLog)
            .ThenInclude(u => u.User)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
