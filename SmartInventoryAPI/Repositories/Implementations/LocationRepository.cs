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
        return await _dbSet.FirstOrDefaultAsync(l => l.OutletCode == outletCode && !l.IsDeleted);
    }

    public async Task<IEnumerable<Location>> GetByTypeAsync(int locationType, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(l => l.LocationType == locationType && !l.IsDeleted)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
