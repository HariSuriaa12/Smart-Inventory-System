using SmartInventoryAPI.Models.DTOs.Request.Vendor;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IVendorService
{
    Task<VendorDto> CreateVendorAsync(CreateVendorRequestDto request);
    Task<VendorDto> GetVendorByIdAsync(long id);
    Task<IEnumerable<VendorDto>> GetAllVendorsAsync(int skip = 0, int take = 10);
    Task<VendorDto> UpdateVendorAsync(long id, UpdateVendorRequestDto request);
    Task DeleteVendorAsync(long id);
}
