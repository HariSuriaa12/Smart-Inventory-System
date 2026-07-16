using System.Security.Cryptography.Xml;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Request.StockTransfer;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Implementations;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockTransferController : ControllerBase
{
    private readonly IStockTransferService _stService;
    private readonly ILogger<StockTransferController> _logger;

    public StockTransferController(IStockTransferService stService, ILogger<StockTransferController> logger)
    {
        _stService = stService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<StockTransferDto>>>> GetAllStockTransfers(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10,
        [FromQuery] long? id = null,
        [FromQuery] int? status = null,
        [FromQuery] long? fromLocationId = null,
        [FromQuery] long? toLocationId = null,
        [FromQuery] long? itemId = null,
        [FromQuery] string? dateFrom = null,
        [FromQuery] string? dateTo = null)
    {
        var transfers = await _stService.GetFilteredAsync(id, status, fromLocationId, toLocationId, itemId, dateFrom, dateTo, skip, take);
        return Ok(new ApiResponseDto<PaginatedResponseDto<StockTransferDto>>
        {
            Success = true,
            Message = "Stock transfers retrieved successfully",
            Data = transfers,
            StatusCode = 200
        });
    }

    [HttpGet("from-location/{locationId}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<object>>>> GetByFromLocation(
        long locationId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var transfers = await _stService.GetByFromLocationAsync(locationId, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<object>>
        {
            Success = true,
            Message = "Stock transfers retrieved by source location successfully",
            Data = transfers,
            StatusCode = 200
        });
    }

    [HttpGet("to-location/{locationId}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<object>>>> GetByToLocation(
        long locationId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var transfers = await _stService.GetByToLocationAsync(locationId, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<object>>
        {
            Success = true,
            Message = "Stock transfers retrieved by destination location successfully",
            Data = transfers,
            StatusCode = 200
        });
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<object>>>> GetByStatus(
        int status,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var transfers = await _stService.GetByStatusAsync(status, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<object>>
        {
            Success = true,
            Message = "Stock transfers retrieved by status successfully",
            Data = transfers,
            StatusCode = 200
        });
    }

    [HttpPost("{id}/receive")]
    public async Task<ActionResult<ApiResponseDto<StockTransferDto>>> ReceiveStock(
        long id,
        [FromBody] ReceiveStockRequestDto request)
    {
        var transfer = await _stService.ReceiveStockAsync(id, request);
        return Ok(new ApiResponseDto<StockTransferDto>
        {
            Success = true,
            Message = "Stock received successfully",
            Data = transfer,
            StatusCode = 200
        });
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<ApiResponseDto<StockTransferDto>>> CancelStockTransfer(
        long id,
        [FromBody] CancelStockTransferRequestDto request)
    {
        var transfer = await _stService.CancelStockTransferAsync(id, request);
        return Ok(new ApiResponseDto<StockTransferDto>
        {
            Success = true,
            Message = "Stock transfer cancelled successfully",
            Data = transfer,
            StatusCode = 200
        });
    }

    [HttpPost("{id}/cancel-return")]
    public async Task<ActionResult<ApiResponseDto<StockTransferDto>>> CancelStockTransferWithReturn(
        long id,
        [FromBody] CancelStockTransferRequestDto request)
    {
        var transfer = await _stService.CancelStockTransferWithReturnAsync(id, request);
        return Ok(new ApiResponseDto<StockTransferDto>
        {
            Success = true,
            Message = "Stock transfer cancelled and stock returned successfully",
            Data = transfer,
            StatusCode = 200
        });
    }

    [HttpPost("transfer")]
    public async Task<ActionResult<ApiResponseDto<StockTransferDto>>> StockTransfer([FromBody] StockTransferRequestDto request)
    {
        var transfer = await _stService.StockTransferAsync(request);
        return Ok(new ApiResponseDto<StockTransferDto>
        {
            Success = true,
            Message = "Stock transfer completed successfully",
            Data = transfer,
            StatusCode = 200
        });
    }
}
