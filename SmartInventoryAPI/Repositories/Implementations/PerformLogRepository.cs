using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class PerformLogRepository : GenericRepository<PerformLog>, IPerformLogRepository
{
    public PerformLogRepository(SmartInventoryDbContext context) : base(context)
    {
    }
}
