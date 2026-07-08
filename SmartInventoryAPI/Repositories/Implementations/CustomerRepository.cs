using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
{
    public CustomerRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<Customer?> GetByCustomerCodeAsync(string customerCode)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.CustomerCode == customerCode && !c.IsDeleted);
    }
}
