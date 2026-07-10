using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class PurchaseOrderRepository : GenericRepository<PurchaseOrderHeader>, IPurchaseOrderRepository
{
    public PurchaseOrderRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<PurchaseOrderHeader?> GetWithItemsAsync(long id)
    {
        return await _dbSet.Include(p => p.Items)
            .ThenInclude(i => i.Item)
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.ID == id && !p.Is_Deleted);
    }

    public async Task<IEnumerable<PurchaseOrderHeader>> GetByVendorAsync(long vendorId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(p => p.Vendor_ID == vendorId && !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<PurchaseOrderHeader>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(p => p.Location_ID == locationId && !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<PurchaseOrderHeader>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(p => p.Status == status && !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
