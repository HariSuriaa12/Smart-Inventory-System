using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class VendorRepository : GenericRepository<Vendor>, IVendorRepository
{
    public VendorRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Vendor?> GetByVendorCodeAsync(string vendorCode)
    {
        return await _dbSet.FirstOrDefaultAsync(v => v.Vendor_Code == vendorCode && !v.IsDeleted);
    }
}
