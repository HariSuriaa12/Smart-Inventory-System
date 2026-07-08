using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface ILocationRepository : IGenericRepository<Location>
{
    Task<Location?> GetByOutletCodeAsync(string outletCode);
    Task<IEnumerable<Location>> GetByTypeAsync(int locationType, int skip = 0, int take = 10);
}
