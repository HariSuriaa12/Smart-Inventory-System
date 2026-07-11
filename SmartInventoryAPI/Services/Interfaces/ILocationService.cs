using SmartInventoryAPI.Models.DTOs.Request.Location;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface ILocationService
{
    Task<LocationDto> CreateLocationAsync(CreateLocationRequestDto request);
    Task<LocationDto> GetLocationByIdAsync(long id);
    Task<PaginatedResponseDto<LocationDto>> GetAllLocationsAsync(int skip = 0, int take = 10);
    Task<LocationDto> UpdateLocationAsync(long id, UpdateLocationRequestDto request);
    Task DeleteLocationAsync(long id);
}
