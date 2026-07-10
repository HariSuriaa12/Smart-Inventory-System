using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Location;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _locationService;
    private readonly ILogger<LocationsController> _logger;

    public LocationsController(ILocationService locationService, ILogger<LocationsController> logger)
    {
        _locationService = locationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<LocationDto>>>> GetAllLocations(
        [FromQuery] int skip,
        [FromQuery] int take)
    {
        IEnumerable<LocationDto> locations;

        if (take > 0)
            locations = await _locationService.GetAllLocationsAsync(skip, take);
        else
            locations = await _locationService.GetAllLocationsAsync();

        return Ok(new ApiResponseDto<IEnumerable<LocationDto>>
        {
            Success = true,
            Message = "Locations retrieved successfully",
            Data = locations,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<LocationDto>>> GetLocationById(long id)
    {
        var location = await _locationService.GetLocationByIdAsync(id);
        return Ok(new ApiResponseDto<LocationDto>
        {
            Success = true,
            Message = "Location retrieved successfully",
            Data = location,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<LocationDto>>> CreateLocation([FromBody] CreateLocationRequestDto request)
    {
        var location = await _locationService.CreateLocationAsync(request);
        return CreatedAtAction(nameof(GetLocationById), new { id = location.ID },
            new ApiResponseDto<LocationDto>
            {
                Success = true,
                Message = "Location created successfully",
                Data = location,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<LocationDto>>> UpdateLocation(
        long id,
        [FromBody] UpdateLocationRequestDto request)
    {
        var location = await _locationService.UpdateLocationAsync(id, request);
        return Ok(new ApiResponseDto<LocationDto>
        {
            Success = true,
            Message = "Location updated successfully",
            Data = location,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteLocation(long id)
    {
        await _locationService.DeleteLocationAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Location deleted successfully",
            StatusCode = 200
        });
    }
}
