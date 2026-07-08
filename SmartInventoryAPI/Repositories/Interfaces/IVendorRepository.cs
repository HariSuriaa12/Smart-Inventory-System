using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IVendorRepository : IGenericRepository<Vendor>
{
    Task<Vendor?> GetByVendorCodeAsync(string vendorCode);
}
