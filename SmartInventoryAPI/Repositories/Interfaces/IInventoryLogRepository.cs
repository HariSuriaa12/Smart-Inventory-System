using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IInventoryLogRepository : IGenericRepository<InventoryLog>
{
    Task<IEnumerable<InventoryLog>> GetInventoryLogs(int skip = 0, int take = 10);
}
