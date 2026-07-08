using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Sales;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISalesService _salesService;
    private readonly ILogger<SalesController> _logger;

    public SalesController(ISalesService salesService, ILogger<SalesController> logger)
    {
        _salesService = salesService;
        _logger = logger;
    }

    /// <summary>
    /// Integration API: Receive sales data from POS system
    /// </summary>
    [HttpPost("import")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponseDto<SalesDetailDto>>> ReceiveSales(
        [FromBody] ReceiveSalesRequestDto request)
    {
        var sales = await _salesService.ReceiveSalesAsync(request);
        return Ok(new ApiResponseDto<SalesDetailDto>
        {
            Success = true,
            Message = "Sales data received successfully",
            Data = sales,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<SalesDto>>>> GetAllSales(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var sales = await _salesService.GetAllSalesAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<SalesDto>>
        {
            Success = true,
            Message = "Sales retrieved successfully",
            Data = sales,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<SalesDetailDto>>> GetSalesById(long id)
    {
        var sales = await _salesService.GetSalesByIdAsync(id);
        return Ok(new ApiResponseDto<SalesDetailDto>
        {
            Success = true,
            Message = "Sales retrieved successfully",
            Data = sales,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet("location/{locationId}")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<SalesDto>>>> GetByLocation(
        long locationId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var sales = await _salesService.GetByLocationAsync(locationId, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<SalesDto>>
        {
            Success = true,
            Message = "Sales retrieved by location successfully",
            Data = sales,
            StatusCode = 200
        });
    }

    [Authorize]
    [HttpGet("date-range")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<SalesDto>>>> GetByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var sales = await _salesService.GetByDateRangeAsync(startDate, endDate, skip, take);
        return Ok(new ApiResponseDto<IEnumerable<SalesDto>>
        {
            Success = true,
            Message = "Sales retrieved by date range successfully",
            Data = sales,
            StatusCode = 200
        });
    }
}
