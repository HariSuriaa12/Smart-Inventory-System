using SmartInventoryAPI.Models.DTOs.Request.Sales;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface ISalesService
{
    Task<SalesDetailDto> ReceiveSalesAsync(ReceiveSalesRequestDto request);
    Task<SalesDetailDto> GetSalesByIdAsync(long id);
    Task<IEnumerable<SalesDto>> GetAllSalesAsync(int skip = 0, int take = 10);
    Task<IEnumerable<SalesDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<SalesDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 10);
}
