using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class LocationRepository : GenericRepository<Location>, ILocationRepository
{
    public LocationRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Location?> GetByOutletCodeAsync(string outletCode)
    {
        return await _dbSet.FirstOrDefaultAsync(l => l.Outlet_Code == outletCode && !l.Is_Deleted);
    }

    public async Task<IEnumerable<Location>> GetByTypeAsync(int locationType, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(l => l.Location_Type == locationType && !l.Is_Deleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountNonDeletedAsync()
    {
        return await _dbSet.Where(i => !i.Is_Deleted).CountAsync();
    }
}
