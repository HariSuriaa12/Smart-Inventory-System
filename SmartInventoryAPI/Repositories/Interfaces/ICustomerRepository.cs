using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface ICustomerRepository : IGenericRepository<Customer>
{
    Task<Customer?> GetByCustomerCodeAsync(string customerCode);
    Task<int> CountNonDeletedAsync();
}
