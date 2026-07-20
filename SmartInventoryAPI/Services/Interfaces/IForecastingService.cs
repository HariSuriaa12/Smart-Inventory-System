using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IForecastingService
{
    Task<PaginatedResponseDto<ForecastDto>> GetForecastsByLocationAsync(long locationId, int skip = 0, int take = 10);
}
