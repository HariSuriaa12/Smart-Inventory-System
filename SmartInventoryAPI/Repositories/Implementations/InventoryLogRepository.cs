using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class InventoryLogRepository : GenericRepository<InventoryLog>, IInventoryLogRepository
{
    public InventoryLogRepository(SmartInventoryDbContext context) : base(context)
    {
    }
}
