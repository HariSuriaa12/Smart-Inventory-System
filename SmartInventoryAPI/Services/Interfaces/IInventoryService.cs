using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IInventoryService
{
    Task<InventoryDto> GetInventoryByIdAsync(long id);
    Task<PaginatedResponseDto<InventoryDetailDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10, string? searchQuery = null);
    Task<PaginatedResponseDto<InventoryDetailDto>> GetByItemAsync(long itemId, int skip = 0, int take = 10, string? searchQuery = null);
    Task<InventoryDetailDto> GetByItemAndLocationAsync(long itemId, long locationId);
    Task<InventoryDto> AdjustInventoryAsync(AdjustInventoryRequestDto request, long userId = 1);
    Task<InventoryDto> StockTransferAsync(StockTransferRequestDto request, long userId = 1);
    Task<IEnumerable<dynamic>> GetInventoryTrendAsync(long locationId);
}
