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
        return await _dbSet.FirstOrDefaultAsync(c => c.Customer_Code == customerCode && !c.Is_Deleted);
    }

    public async Task<int> CountNonDeletedAsync()
    {
        return await _dbSet.Where(i => !i.Is_Deleted).CountAsync();
    }
}
