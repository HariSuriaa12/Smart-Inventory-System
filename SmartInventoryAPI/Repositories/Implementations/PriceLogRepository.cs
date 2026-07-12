using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class PriceLogRepository : GenericRepository<PriceLog>, IPriceLogRepository
{
    public PriceLogRepository(SmartInventoryDbContext context) : base(context)
    {
    }
}
