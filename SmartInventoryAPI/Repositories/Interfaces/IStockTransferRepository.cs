using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IStockTransferRepository : IGenericRepository<StockTransfer>
{
    Task<IEnumerable<StockTransfer>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetByStatusAsync(int status, int skip = 0, int take = 10);
    Task<IEnumerable<StockTransfer>> GetByItemAsync(long itemId, int skip = 0, int take = 10);
}
