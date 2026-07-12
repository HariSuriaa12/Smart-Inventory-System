using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IInventoryService
{
    Task<InventoryDto> GetInventoryByIdAsync(long id);
    Task<IEnumerable<InventoryDetailDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<InventoryDetailDto>> GetByItemAsync(long itemId, int skip = 0, int take = 10);
    Task<InventoryDto> AdjustInventoryAsync(AdjustInventoryRequestDto request);
    Task<InventoryDto> StockTransferAsync(StockTransferRequestDto request);
}
