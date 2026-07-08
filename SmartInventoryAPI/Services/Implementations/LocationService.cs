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
        location.CreationDate = DateTime.UtcNow;

        var createdLocation = await _unitOfWork.Locations.AddAsync(location);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Location {OutletCode} created successfully", location.OutletCode);
        return _mapper.Map<LocationDto>(createdLocation);
    }

    public async Task<LocationDto> GetLocationByIdAsync(long id)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(id);
        if (location == null || location.IsDeleted)
            throw new NotFoundException("Location not found");

        return _mapper.Map<LocationDto>(location);
    }

    public async Task<IEnumerable<LocationDto>> GetAllLocationsAsync(int skip = 0, int take = 10)
    {
        var locations = await _unitOfWork.Locations.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<LocationDto>>(locations.Where(l => !l.IsDeleted));
    }

    public async Task<LocationDto> UpdateLocationAsync(long id, UpdateLocationRequestDto request)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(id);
        if (location == null || location.IsDeleted)
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

        location.IsDeleted = true;
        await _unitOfWork.Locations.UpdateAsync(location);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Location {ID} deleted successfully", id);
    }
}
