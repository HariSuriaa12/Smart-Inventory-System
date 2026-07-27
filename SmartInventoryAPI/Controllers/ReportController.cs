using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportController> _logger;

    public ReportController(IReportService reportService, ILogger<ReportController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    [HttpGet("export-master-data")]
    public async Task<IActionResult> ExportMasterData(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Exporting master data");
            var csvBytes = await _reportService.ExportMasterDataAsync(startDate, endDate);
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
            return File(csvBytes, "text/csv", $"master_data_{timestamp}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting master data");
            return StatusCode(500, new ApiResponseDto
            {
                Success = false,
                Message = "Error exporting master data",
                StatusCode = 500
            });
        }
    }

    [HttpGet("export-transactional-data")]
    public async Task<IActionResult> ExportTransactionalData(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Exporting transactional data");
            var csvBytes = await _reportService.ExportTransactionalDataAsync(startDate, endDate);
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
            return File(csvBytes, "text/csv", $"transactional_data_{timestamp}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transactional data");
            return StatusCode(500, new ApiResponseDto
            {
                Success = false,
                Message = "Error exporting transactional data",
                StatusCode = 500
            });
        }
    }

    [HttpGet("export-all-data")]
    public async Task<IActionResult> ExportAllData(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Exporting all data");
            var csvBytes = await _reportService.ExportAllDataAsync(startDate, endDate);
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
            return File(csvBytes, "text/csv", $"complete_inventory_export_{timestamp}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting all data");
            return StatusCode(500, new ApiResponseDto
            {
                Success = false,
                Message = "Error exporting all data",
                StatusCode = 500
            });
        }
    }
}
