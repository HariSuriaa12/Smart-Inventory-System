using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _poService;
    private readonly ILogger<PurchaseOrdersController> _logger;

    public PurchaseOrdersController(IPurchaseOrderService poService, ILogger<PurchaseOrdersController> logger)
    {
        _poService = poService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<PurchaseOrderDto>>>> GetAllPurchaseOrders(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var pos = await _poService.GetAllPurchaseOrdersAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<PurchaseOrderDto>>
        {
            Success = true,
            Message = "Purchase orders retrieved successfully",
            Data = pos,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<PurchaseOrderDetailDto>>> GetPurchaseOrderById(long id)
    {
        var po = await _poService.GetPurchaseOrderByIdAsync(id);
        return Ok(new ApiResponseDto<PurchaseOrderDetailDto>
        {
            Success = true,
            Message = "Purchase order retrieved successfully",
            Data = po,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<PurchaseOrderDetailDto>>> CreatePurchaseOrder(
        [FromBody] CreatePurchaseOrderRequestDto request)
    {
        var po = await _poService.CreatePurchaseOrderAsync(request);
        return CreatedAtAction(nameof(GetPurchaseOrderById), new { id = po.ID },
            new ApiResponseDto<PurchaseOrderDetailDto>
            {
                Success = true,
                Message = "Purchase order created successfully",
                Data = po,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<PurchaseOrderDetailDto>>> UpdatePurchaseOrder(
        long id,
        [FromBody] UpdatePurchaseOrderRequestDto request)
    {
        var po = await _poService.UpdatePurchaseOrderAsync(id, request);
        return Ok(new ApiResponseDto<PurchaseOrderDetailDto>
        {
            Success = true,
            Message = "Purchase order updated successfully",
            Data = po,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeletePurchaseOrder(long id)
    {
        await _poService.DeletePurchaseOrderAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Purchase order deleted successfully",
            StatusCode = 200
        });
    }

    [HttpGet("vendor/{vendorId}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<PurchaseOrderDto>>>> GetByVendor(
        long vendorId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var pos = await _poService.GetByVendorAsync(vendorId, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<PurchaseOrderDto>>
        {
            Success = true,
            Message = "Purchase orders retrieved by vendor successfully",
            Data = pos,
            StatusCode = 200
        });
    }
}
