using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class ForecastingRepository : IForecastingRepository
{
    private readonly SmartInventoryDbContext _context;

    public ForecastingRepository(SmartInventoryDbContext context)
    {
        _context = context;
    }

    public async Task<List<ForecastedResult>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _context.Forecasted_Result
            .Where(f => f.Location_ID == locationId)
            .Include(f => f.Item)
            .OrderByDescending(f => f.Creation_Date)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountByLocationAsync(long locationId)
    {
        return await _context.Forecasted_Result
            .CountAsync(f => f.Location_ID == locationId);
    }
}
