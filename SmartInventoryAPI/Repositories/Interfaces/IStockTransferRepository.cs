using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IStockTransferRepository : IGenericRepository<StockTransfer>
{
    Task<IEnumerable<StockTransfer>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetByStatusAsync(int status, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetByItemAsync(long itemId, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetAllWithDetailsAsync(int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetFilteredAsync(long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null, long? itemId = null, string? dateFrom = null, string? dateTo = null, int skip = 0, int take = 10);
    Task<int> CountFilteredAsync(long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null, long? itemId = null, string? dateFrom = null, string? dateTo = null);
}
