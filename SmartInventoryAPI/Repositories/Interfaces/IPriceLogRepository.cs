using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IPriceLogRepository : IGenericRepository<PriceLog>
{
    Task<IEnumerable<PriceLog>> GetPriceLogs(int skip = 0, int take = 10);
}
