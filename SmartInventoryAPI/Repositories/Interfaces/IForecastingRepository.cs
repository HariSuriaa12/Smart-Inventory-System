using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IForecastingRepository
{
    Task<List<ForecastedResult>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<int> CountByLocationAsync(long locationId);
}
