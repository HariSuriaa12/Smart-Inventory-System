using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Location;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class LocationService : ILocationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<LocationService> _logger;

    public LocationService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<LocationService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<LocationDto> CreateLocationAsync(CreateLocationRequestDto request)
    {
        var location = _mapper.Map<Location>(request);
        location.Creation_Date = DateTime.UtcNow;

        var createdLocation = await _unitOfWork.Locations.AddAsync(location);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Location {OutletCode} created successfully", location.Outlet_Code);
        return _mapper.Map<LocationDto>(createdLocation);
    }

    public async Task<LocationDto> GetLocationByIdAsync(long id)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(id);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        return _mapper.Map<LocationDto>(location);
    }

    public async Task<PaginatedResponseDto<LocationDto>> GetAllLocationsAsync(int skip, int take)
    {
        IEnumerable<Location> locations = null;
        var total = 0;
        var page = 0;
        var totalPages = 0;

        if (take > 0)
        {
            locations = await _unitOfWork.Locations.GetAllAsync(skip, take);

            total = await _unitOfWork.Locations.CountNonDeletedAsync();

            page = (skip / take) + 1;
            totalPages = (int)Math.Ceiling((double)total / take);
        }
        else
            locations = await _unitOfWork.Locations.GetAllAsync();

        var activeLocations = locations.Where(l => !l.Is_Deleted).ToList();

        return new PaginatedResponseDto<LocationDto>
        {
            Data = _mapper.Map<IEnumerable<LocationDto>>(activeLocations),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<LocationDto> UpdateLocationAsync(long id, UpdateLocationRequestDto request)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(id);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        _mapper.Map(request, location);
        await _unitOfWork.Locations.UpdateAsync(location);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Location {ID} updated successfully", id);
        return _mapper.Map<LocationDto>(location);
    }

    public async Task DeleteLocationAsync(long id)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(id);
        if (location == null)
            throw new NotFoundException("Location not found");

        location.Is_Deleted = true;
        // Ensure deletion timestamp is UTC
        if (location.Creation_Date.Kind == DateTimeKind.Unspecified)
        {
            location.Creation_Date = DateTime.SpecifyKind(location.Creation_Date, DateTimeKind.Utc);
        }
        await _unitOfWork.Locations.UpdateAsync(location);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Location {ID} deleted successfully", id);
    }
}
