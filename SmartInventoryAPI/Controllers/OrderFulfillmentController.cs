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
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<OrderFulfillmentDto>>>> GetAllOrderFulfillments(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10,
        [FromQuery] long? fulfillmentId = null,
        [FromQuery] long? customerId = null,
        [FromQuery] bool? unprocessedOnly = null,
        [FromQuery] long? locationId = null)
    {
        var orders = await _ofService.GetAllOrderFulfillmentsAsync(skip, take, fulfillmentId, customerId, unprocessedOnly, locationId);
        return Ok(new ApiResponseDto<PaginatedResponseDto<OrderFulfillmentDto>>
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
    [HttpPost("{id}/verify-and-assign")]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> VerifyAndAssign(
        long id,
        [FromQuery] long locationId)
    {
        var order = await _ofService.VerifyAndAssignAsync(id, locationId);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Order fulfillment verified and assigned successfully",
            Data = order,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpPost("{id}/items/{itemId}/ship")]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> ShipItem(
        long id,
        long itemId,
        [FromQuery] decimal shippedQuantity)
    {
        var order = await _ofService.ShipItemAsync(id, itemId, shippedQuantity);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Item shipped successfully",
            Data = order,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpPost("{id}/items/{itemId}/cancel")]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> CancelItem(
        long id,
        long itemId)
    {
        var order = await _ofService.CancelItemAsync(id, itemId);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Item cancelled successfully",
            Data = order,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpPost("{id}/items/{itemId}/cancel-with-return")]
    public async Task<ActionResult<ApiResponseDto<OrderFulfillmentDetailDto>>> CancelItemWithReturn(
        long id,
        long itemId)
    {
        var order = await _ofService.CancelItemWithReturnAsync(id, itemId);
        return Ok(new ApiResponseDto<OrderFulfillmentDetailDto>
        {
            Success = true,
            Message = "Item cancelled with return successfully",
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
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<OrderFulfillmentDto>>>> GetByCustomer(
        long customerId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var orders = await _ofService.GetByCustomerAsync(customerId, skip, take);
        return Ok(new ApiResponseDto<PaginatedResponseDto<OrderFulfillmentDto>>
        {
            Success = true,
            Message = "Order fulfillments retrieved by customer successfully",
            Data = orders,
            StatusCode = 200
        });
    }
}
