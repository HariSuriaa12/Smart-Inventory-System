using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Vendor;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class VendorService : IVendorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<VendorService> _logger;

    public VendorService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<VendorService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<VendorDto> CreateVendorAsync(CreateVendorRequestDto request)
    {
        var vendor = _mapper.Map<Vendor>(request);
        vendor.Creation_Date = DateTime.UtcNow;

        var createdVendor = await _unitOfWork.Vendors.AddAsync(vendor);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Vendor {VendorCode} created successfully", vendor.Vendor_Code);
        return _mapper.Map<VendorDto>(createdVendor);
    }

    public async Task<VendorDto> GetVendorByIdAsync(long id)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(id);
        if (vendor == null || vendor.Is_Deleted)
            throw new NotFoundException("Vendor not found");

        return _mapper.Map<VendorDto>(vendor);
    }

    public async Task<PaginatedResponseDto<VendorDto>> GetAllVendorsAsync(int skip = 0, int take = 10)
    {
        var vendors = await _unitOfWork.Vendors.GetAllAsync(skip, take);
        var total = await _unitOfWork.Vendors.CountNonDeletedAsync();

        var activeVendors = vendors.Where(v => !v.Is_Deleted).ToList();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<VendorDto>
        {
            Data = _mapper.Map<IEnumerable<VendorDto>>(activeVendors),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<VendorDto> UpdateVendorAsync(long id, UpdateVendorRequestDto request)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(id);
        if (vendor == null || vendor.Is_Deleted)
            throw new NotFoundException("Vendor not found");

        _mapper.Map(request, vendor);
        await _unitOfWork.Vendors.UpdateAsync(vendor);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Vendor {ID} updated successfully", id);
        return _mapper.Map<VendorDto>(vendor);
    }

    public async Task DeleteVendorAsync(long id)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(id);
        if (vendor == null)
            throw new NotFoundException("Vendor not found");

        vendor.Is_Deleted = true;
        // Ensure deletion timestamp is UTC
        if (vendor.Creation_Date.Kind == DateTimeKind.Unspecified)
        {
            vendor.Creation_Date = DateTime.SpecifyKind(vendor.Creation_Date, DateTimeKind.Utc);
        }
        await _unitOfWork.Vendors.UpdateAsync(vendor);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Vendor {ID} deleted successfully", id);
    }
}
