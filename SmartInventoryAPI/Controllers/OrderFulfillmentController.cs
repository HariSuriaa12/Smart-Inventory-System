using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderFulfillmentController : ControllerBase
{
    private readonly IOrderFulfillmentService _ofService;
    private readonly ILogger<OrderFulfillmentController> _logger;

    public OrderFulfillmentController(IOrderFulfillmentService ofService, ILogger<OrderFulfillmentController> logger)
    {
        _ofService = ofService;
        _logger = logger;
    }

    /// <summary>
    /// Integration API: Receive order fulfillment from external customer system
    /// </summary>
    [HttpPost("receive")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> ReceiveOrderFulfillment(
        [FromBody] ReceiveOrderFulfillmentRequestDto request)
    {
        var order = await _ofService.ReceiveOrderFulfillmentAsync(request);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Order fulfillment received successfully",
            Data = order,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<OrderFulfillmentDto>>>> GetAllOrderFulfillments(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var orders = await _ofService.GetAllOrderFulfillmentsAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<OrderFulfillmentDto>>
        {
            Success = true,
            Message = "Order fulfillments retrieved successfully",
            Data = orders,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> GetOrderFulfillmentById(long id)
    {
        var order = await _ofService.GetOrderFulfillmentByIdAsync(id);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Order fulfillment retrieved successfully",
            Data = order,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> UpdateOrderFulfillment(
        long id,
        [FromBody] UpdateOrderFulfillmentRequestDto request)
    {
        var order = await _ofService.UpdateOrderFulfillmentAsync(id, request);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Order fulfillment updated successfully",
            Data = order,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteOrderFulfillment(long id)
    {
        await _ofService.DeleteOrderFulfillmentAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Order fulfillment deleted successfully",
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<OrderFulfillmentDto>>>> GetByCustomer(
        long customerId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var orders = await _ofService.GetByCustomerAsync(customerId, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<OrderFulfillmentDto>>
        {
            Success = true,
            Message = "Order fulfillments retrieved by customer successfully",
            Data = orders,
            StatusCode = 200
        });
    }
}
