using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Item;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(IItemService itemService, ILogger<ItemsController> logger)
    {
        _itemService = itemService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<ItemDto>>>> GetAllItems(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var items = await _itemService.GetAllItemsAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<ItemDto>>
        {
            Success = true,
            Message = "Items retrieved successfully",
            Data = items,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<ItemDto>>> GetItemById(long id)
    {
        var item = await _itemService.GetItemByIdAsync(id);
        return Ok(new ApiResponseDto<ItemDto>
        {
            Success = true,
            Message = "Item retrieved successfully",
            Data = item,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<ItemDto>>> CreateItem([FromBody] CreateItemRequestDto request)
    {
        var item = await _itemService.CreateItemAsync(request);
        return CreatedAtAction(nameof(GetItemById), new { id = item.ID },
            new ApiResponseDto<ItemDto>
            {
                Success = true,
                Message = "Item created successfully",
                Data = item,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<ItemDto>>> UpdateItem(
        long id,
        [FromBody] UpdateItemRequestDto request)
    {
        var item = await _itemService.UpdateItemAsync(id, request);
        return Ok(new ApiResponseDto<ItemDto>
        {
            Success = true,
            Message = "Item updated successfully",
            Data = item,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteItem(long id)
    {
        await _itemService.DeleteItemAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Item deleted successfully",
            StatusCode = 200
        });
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<ItemDto>>>> GetByCategory(
        string category,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var items = await _itemService.GetByCategoryAsync(category, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<ItemDto>>
        {
            Success = true,
            Message = "Items retrieved by category successfully",
            Data = items,
            StatusCode = 200
        });
    }
}
