using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class SalesRepository : GenericRepository<Sales>, ISalesRepository
{
    public SalesRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Sales?> GetWithItemsAsync(long id)
    {
        return await _dbSet.Include(s => s.Items)
            .ThenInclude(i => i.Item)
            .Include(s => s.Location)
            .FirstOrDefaultAsync(s => s.ID == id && !s.Is_Deleted);
    }

    public async Task<IEnumerable<Sales>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Location_ID == locationId && !s.Is_Deleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Sales_Date >= DateTime.SpecifyKind(startDate, DateTimeKind.Utc) && s.Sales_Date <= DateTime.SpecifyKind(endDate, DateTimeKind.Utc) && !s.Is_Deleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(s => s.Sales_Status == status && !s.Is_Deleted)
            .Include(s => s.Location)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sales>> GetFilteredAsync(
        long? salesId = null, string? salesNumber = null, int? status = null,
        string? dateFrom = null, string? dateTo = null, int skip = 0, int take = 10)
    {
        IQueryable<Sales> query = _dbSet.Where(s => !s.Is_Deleted)
            .Include(s => s.Location)
            .Include(s => s.Items);

        if (salesId.HasValue)
            query = query.Where(s => s.ID == salesId.Value);

        if (!string.IsNullOrEmpty(salesNumber))
            query = query.Where(s => s.Sales_Number != null && s.Sales_Number.Contains(salesNumber));

        if (status.HasValue)
            query = query.Where(s => s.Sales_Status == status.Value);

        if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            query = query.Where(s => s.Sales_Date >= DateTime.SpecifyKind(fromDate.Date, DateTimeKind.Utc));

        if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            query = query.Where(s => s.Sales_Date <= DateTime.SpecifyKind(toDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc));

        return await query
            .OrderByDescending(s => s.Sales_Date)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountFilteredAsync(
        long? salesId = null, string? salesNumber = null, int? status = null,
        string? dateFrom = null, string? dateTo = null)
    {
        var query = _dbSet.Where(s => !s.Is_Deleted);

        if (salesId.HasValue)
            query = query.Where(s => s.ID == salesId.Value);

        if (!string.IsNullOrEmpty(salesNumber))
            query = query.Where(s => s.Sales_Number != null && s.Sales_Number.Contains(salesNumber));

        if (status.HasValue)
            query = query.Where(s => s.Sales_Status == status.Value);

        if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            query = query.Where(s => s.Sales_Date >= DateTime.SpecifyKind(fromDate.Date, DateTimeKind.Utc)); //DateTime.SpecifyKind(po.Purchase_Date, DateTimeKind.Utc)

        if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            query = query.Where(s => s.Sales_Date <= DateTime.SpecifyKind(toDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc));

        return await query.CountAsync();
    }
}
