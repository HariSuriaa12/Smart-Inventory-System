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
        //return await _dbSet.Include(p => p.Items)
        //    .ThenInclude(i => i.Item)
        //    .Include(p => p.Vendor)
        //    .FirstOrDefaultAsync(p => p.ID == id && !p.Is_Deleted);

        return await _dbSet
            //.Where(p => !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Include(p => p.Location)
            .Include(p => p.Items)
            .ThenInclude(i => i.Item)
            .Include(p => p.User)
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

    public async Task<int> CountNonDeletedAsync()
    {
        return await _dbSet.Where(p => !p.Is_Deleted).CountAsync();
    }

    public async Task<int> CountByVendorAsync(long vendorId)
    {
        return await _dbSet.Where(p => p.Vendor_ID == vendorId && !p.Is_Deleted).CountAsync();
    }

    public async Task<IEnumerable<PurchaseOrderHeader>> GetAllWithDetailsAsync(int skip = 0, int take = 10)
    {
        return await _dbSet
            .Where(p => !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Include(p => p.Location)
            .Include(p => p.Items)
            .ThenInclude(i => i.Item)
            .Include(p => p.User)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<PurchaseOrderHeader>> GetByVendorWithDetailsAsync(long vendorId, int skip = 0, int take = 10)
    {
        return await _dbSet
            .Where(p => p.Vendor_ID == vendorId && !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Include(p => p.Location)
            .Include(p => p.Items)
            .ThenInclude(i => i.Item)
            .Include(p => p.User)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<PurchaseOrderHeader>> GetFilteredAsync(
        long? poId = null, string? poRefNo = null, long? vendorId = null, int? status = null,
        string? dateFrom = null, string? dateTo = null, int skip = 0, int take = 10)
    {
        IQueryable<PurchaseOrderHeader> query = _dbSet
            .Where(p => !p.Is_Deleted)
            .Include(p => p.Vendor)
            .Include(p => p.Location)
            .Include(p => p.Items)
            .ThenInclude(i => i.Item)
            .Include(p => p.User);

        if (poId.HasValue)
            query = query.Where(p => p.ID == poId.Value);

        if (!string.IsNullOrEmpty(poRefNo))
            query = query.Where(p => p.PO_Reference_No != null && p.PO_Reference_No.Contains(poRefNo));

        if (vendorId.HasValue)
            query = query.Where(p => p.Vendor_ID == vendorId.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            query = query.Where(p => p.Purchase_Date >= fromDate);

        if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            query = query.Where(p => p.Purchase_Date <= toDate.AddDays(1));

        return await query
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountFilteredAsync(
        long? poId = null, string? poRefNo = null, long? vendorId = null, int? status = null,
        string? dateFrom = null, string? dateTo = null)
    {
        var query = _dbSet.Where(p => !p.Is_Deleted);

        if (poId.HasValue)
            query = query.Where(p => p.ID == poId.Value);

        if (!string.IsNullOrEmpty(poRefNo))
            query = query.Where(p => p.PO_Reference_No != null && p.PO_Reference_No.Contains(poRefNo));

        if (vendorId.HasValue)
            query = query.Where(p => p.Vendor_ID == vendorId.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            query = query.Where(p => p.Purchase_Date >= fromDate);

        if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            query = query.Where(p => p.Purchase_Date <= toDate.AddDays(1));

        return await query.CountAsync();
    }
}
