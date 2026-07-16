using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Request.StockTransfer;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IStockTransferService
{
    Task<PaginatedResponseDto<StockTransferDto>> GetFilteredAsync(long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null,
        long? itemId = null, string? dateFrom = null, string? dateTo = null, int skip = 0, int take = 10);
    Task<PaginatedResponseDto<StockTransferDto>> GetAllStockTransfersAsync(int skip = 0, int take = 10);
    Task<IEnumerable<object>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<object>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<object>> GetByStatusAsync(int status, int skip = 0, int take = 10);
    Task<StockTransferDto> ReceiveStockAsync(long id, ReceiveStockRequestDto request);
    Task<StockTransferDto> CancelStockTransferAsync(long id, CancelStockTransferRequestDto request);
    Task<StockTransferDto> CancelStockTransferWithReturnAsync(long id, CancelStockTransferRequestDto request);
    Task<StockTransferDto> StockTransferAsync(StockTransferRequestDto request);
}
