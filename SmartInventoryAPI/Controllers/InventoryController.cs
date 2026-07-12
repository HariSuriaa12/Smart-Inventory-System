using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<InventoryDto>>> GetInventoryById(long id)
    {
        var inventory = await _inventoryService.GetInventoryByIdAsync(id);
        return Ok(new ApiResponseDto<InventoryDto>
        {
            Success = true,
            Message = "Inventory retrieved successfully",
            Data = inventory,
            StatusCode = 200
        });
    }

    [HttpGet("location/{locationId}")]
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<InventoryDetailDto>>>> GetByLocation(
        long locationId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var inventories = await _inventoryService.GetByLocationAsync(locationId, skip, take);
        return Ok(new ApiResponseDto<PaginatedResponseDto<InventoryDetailDto>>
        {
            Success = true,
            Message = "Inventory retrieved by location successfully",
            Data = inventories,
            StatusCode = 200
        });
    }

    [HttpGet("item/{itemId}")]
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<InventoryDetailDto>>>> GetByItem(
        long itemId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var inventories = await _inventoryService.GetByItemAsync(itemId, skip, take);
        return Ok(new ApiResponseDto<PaginatedResponseDto<InventoryDetailDto>>
        {
            Success = true,
            Message = "Inventory retrieved by item successfully",
            Data = inventories,
            StatusCode = 200
        });
    }

    [HttpPut("adjust")]
    public async Task<ActionResult<ApiResponseDto<InventoryDto>>> AdjustInventory([FromBody] AdjustInventoryRequestDto request)
    {
        var inventory = await _inventoryService.AdjustInventoryAsync(request);
        return Ok(new ApiResponseDto<InventoryDto>
        {
            Success = true,
            Message = "Inventory adjusted successfully",
            Data = inventory,
            StatusCode = 200
        });
    }

    [HttpPost("transfer")]
    public async Task<ActionResult<ApiResponseDto<InventoryDto>>> StockTransfer([FromBody] StockTransferRequestDto request)
    {
        var inventory = await _inventoryService.StockTransferAsync(request);
        return Ok(new ApiResponseDto<InventoryDto>
        {
            Success = true,
            Message = "Stock transfer completed successfully",
            Data = inventory,
            StatusCode = 200
        });
    }
}
