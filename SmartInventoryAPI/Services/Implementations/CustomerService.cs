using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Customer;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CustomerService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequestDto request)
    {
        var customer = _mapper.Map<Customer>(request);
        customer.Creation_Date = DateTime.UtcNow;

        var createdCustomer = await _unitOfWork.Customers.AddAsync(customer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Customer {CustomerCode} created successfully", customer.Customer_Code);
        return _mapper.Map<CustomerDto>(createdCustomer);
    }

    public async Task<CustomerDto> GetCustomerByIdAsync(long id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null || customer.IsDeleted)
            throw new NotFoundException("Customer not found");

        return _mapper.Map<CustomerDto>(customer);
    }

    public async Task<PaginatedResponseDto<CustomerDto>> GetAllCustomersAsync(int skip = 0, int take = 10)
    {
        var customers = await _unitOfWork.Customers.GetAllAsync(skip, take);
        var total = await _unitOfWork.Customers.CountNonDeletedAsync();

        var activeCustomers = customers.Where(c => !c.IsDeleted).ToList();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<CustomerDto>
        {
            Data = _mapper.Map<IEnumerable<CustomerDto>>(activeCustomers),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<CustomerDto> UpdateCustomerAsync(long id, UpdateCustomerRequestDto request)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null || customer.IsDeleted)
            throw new NotFoundException("Customer not found");

        _mapper.Map(request, customer);
        await _unitOfWork.Customers.UpdateAsync(customer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Customer {ID} updated successfully", id);
        return _mapper.Map<CustomerDto>(customer);
    }

    public async Task DeleteCustomerAsync(long id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            throw new NotFoundException("Customer not found");

        customer.IsDeleted = true;
        await _unitOfWork.Customers.UpdateAsync(customer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Customer {ID} deleted successfully", id);
    }
}
