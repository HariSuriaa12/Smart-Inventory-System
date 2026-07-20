using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ForecastingController : ControllerBase
{
    private readonly IForecastingService _forecastingService;
    private readonly ILogger<ForecastingController> _logger;

    public ForecastingController(IForecastingService forecastingService, ILogger<ForecastingController> logger)
    {
        _forecastingService = forecastingService;
        _logger = logger;
    }

    [HttpGet("location/{locationId}")]
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<ForecastDto>>>> GetByLocation(
        long locationId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        try
        {
            var result = await _forecastingService.GetForecastsByLocationAsync(locationId, skip, take);
            return Ok(new ApiResponseDto<PaginatedResponseDto<ForecastDto>>
            {
                Success = true,
                Message = "Forecasts retrieved successfully",
                Data = result,
                StatusCode = 200
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching forecasts for location {LocationId}", locationId);
            return BadRequest(new ApiResponseDto<PaginatedResponseDto<ForecastDto>>
            {
                Success = false,
                Message = "Error retrieving forecasts",
                StatusCode = 400,
                Errors = new List<string> { ex.Message }
            });
        }
    }
}
