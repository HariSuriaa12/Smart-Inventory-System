using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IPerformLogRepository : IGenericRepository<PerformLog>
{
    Task<IEnumerable<PerformLog>> GetPerformedLogs(int skip = 0, int take = 10);
}
