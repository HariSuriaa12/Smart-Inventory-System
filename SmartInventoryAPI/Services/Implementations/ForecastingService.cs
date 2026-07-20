using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class ForecastingService : IForecastingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ForecastingService> _logger;

    public ForecastingService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ForecastingService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PaginatedResponseDto<ForecastDto>> GetForecastsByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(locationId);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        var total = await _unitOfWork.Forecasting.CountByLocationAsync(locationId);
        var forecasts = await _unitOfWork.Forecasting.GetByLocationAsync(locationId, skip, take);

        var forecastDtos = _mapper.Map<List<ForecastDto>>(forecasts);

        _logger.LogInformation("Fetched {Count} forecasts for Location {LocationID}", forecasts.Count, locationId);

        var page = (skip / take) + 1;
        return new PaginatedResponseDto<ForecastDto>
        {
            Data = forecastDtos,
            Total = total,
            Take = take,
            Page = page,
            TotalPages = (int)Math.Ceiling(total / (double)take)
        };
    }
}
