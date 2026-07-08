using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IStockTransferService
{
    Task<IEnumerable<object>> GetAllStockTransfersAsync(int skip = 0, int take = 10);
    Task<IEnumerable<object>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<object>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<object>> GetByStatusAsync(int status, int skip = 0, int take = 10);
}
