using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Customer;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(ICustomerService customerService, ILogger<CustomersController> logger)
    {
        _customerService = customerService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<CustomerDto>>>> GetAllCustomers(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var customers = await _customerService.GetAllCustomersAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<CustomerDto>>
        {
            Success = true,
            Message = "Customers retrieved successfully",
            Data = customers,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<CustomerDto>>> GetCustomerById(long id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);
        return Ok(new ApiResponseDto<CustomerDto>
        {
            Success = true,
            Message = "Customer retrieved successfully",
            Data = customer,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<CustomerDto>>> CreateCustomer([FromBody] CreateCustomerRequestDto request)
    {
        var customer = await _customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(GetCustomerById), new { id = customer.ID },
            new ApiResponseDto<CustomerDto>
            {
                Success = true,
                Message = "Customer created successfully",
                Data = customer,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<CustomerDto>>> UpdateCustomer(
        long id,
        [FromBody] UpdateCustomerRequestDto request)
    {
        var customer = await _customerService.UpdateCustomerAsync(id, request);
        return Ok(new ApiResponseDto<CustomerDto>
        {
            Success = true,
            Message = "Customer updated successfully",
            Data = customer,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteCustomer(long id)
    {
        await _customerService.DeleteCustomerAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Customer deleted successfully",
            StatusCode = 200
        });
    }
}
