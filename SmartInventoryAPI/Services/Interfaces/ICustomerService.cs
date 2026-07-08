using SmartInventoryAPI.Models.DTOs.Request.Customer;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface ICustomerService
{
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequestDto request);
    Task<CustomerDto> GetCustomerByIdAsync(long id);
    Task<IEnumerable<CustomerDto>> GetAllCustomersAsync(int skip = 0, int take = 10);
    Task<CustomerDto> UpdateCustomerAsync(long id, UpdateCustomerRequestDto request);
    Task DeleteCustomerAsync(long id);
}
