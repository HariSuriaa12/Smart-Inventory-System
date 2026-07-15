using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class StockTransferRepository : GenericRepository<StockTransfer>, IStockTransferRepository
{
    public StockTransferRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    private IQueryable<StockTransfer> IncludeRelatedEntities(IQueryable<StockTransfer> query)
    {
        return query
            .Include(s => s.Item)
            .Include(s => s.FromLocation)
            .Include(s => s.ToLocation)
            .Include(s => s.User);
    }

    public async Task<IEnumerable<StockTransfer>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await IncludeRelatedEntities(_dbSet.Where(s => s.From_Location_ID == locationId && !s.Is_Deleted))
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await IncludeRelatedEntities(_dbSet.Where(s => s.To_Location_ID == locationId && !s.Is_Deleted))
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await IncludeRelatedEntities(_dbSet.Where(s => s.Status == status && !s.Is_Deleted))
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetByItemAsync(long itemId, int skip = 0, int take = 10)
    {
        return await IncludeRelatedEntities(_dbSet.Where(s => s.Item_ID == itemId && !s.Is_Deleted))
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetAllWithDetailsAsync(int skip = 0, int take = 10)
    {
        return await IncludeRelatedEntities(_dbSet.Where(s => !s.Is_Deleted))
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockTransfer>> GetFilteredAsync(
        long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null,
        long? itemId = null, string? dateFrom = null, string? dateTo = null,
        int skip = 0, int take = 10)
    {
        IQueryable<StockTransfer> query = _dbSet.Where(s => !s.Is_Deleted);
        query = IncludeRelatedEntities(query);

        if (id.HasValue)
            query = query.Where(s => s.ID == id.Value);

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        if (fromLocationId.HasValue)
            query = query.Where(s => s.From_Location_ID == fromLocationId.Value);

        if (toLocationId.HasValue)
            query = query.Where(s => s.To_Location_ID == toLocationId.Value);

        if (itemId.HasValue)
            query = query.Where(s => s.Item_ID == itemId.Value);

        if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            query = query.Where(s => s.Transfer_Date >= fromDate);

        if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            query = query.Where(s => s.Transfer_Date <= toDate.AddDays(1));

        return await query
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountFilteredAsync(
        long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null,
        long? itemId = null, string? dateFrom = null, string? dateTo = null)
    {
        var query = _dbSet.Where(s => !s.Is_Deleted);

        if (id.HasValue)
            query = query.Where(s => s.ID == id.Value);

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        if (fromLocationId.HasValue)
            query = query.Where(s => s.From_Location_ID == fromLocationId.Value);

        if (toLocationId.HasValue)
            query = query.Where(s => s.To_Location_ID == toLocationId.Value);

        if (itemId.HasValue)
            query = query.Where(s => s.Item_ID == itemId.Value);

        if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            query = query.Where(s => s.Transfer_Date >= fromDate);

        if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            query = query.Where(s => s.Transfer_Date <= toDate.AddDays(1));

        return await query.CountAsync();
    }
}
