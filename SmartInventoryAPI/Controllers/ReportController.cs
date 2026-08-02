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

    [HttpPost("export-master-data")]
    public async Task<IActionResult> ExportMasterData(
        [FromBody] ExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting master data with modules: {Modules}", string.Join(", ", request.Modules));
            var excelBytes = await _reportService.ExportMasterDataAsync(request.Modules, request.StartDate, request.EndDate);
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"master_data_{timestamp}.xlsx");
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

    [HttpPost("export-transactional-data")]
    public async Task<IActionResult> ExportTransactionalData(
        [FromBody] ExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting transactional data with modules: {Modules}", string.Join(", ", request.Modules));
            var fileContentDict = await _reportService.ExportTransactionalDataAsync(request.Modules, request.StartDate, request.EndDate);
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");

            if (fileContentDict.Keys.First() == "Excel")
                return File(fileContentDict.Values.First(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"transactional_data_{timestamp}.xlsx");
            else
                return File(fileContentDict.Values.First(), "text/csv", $"{request.Modules[0]}_Report_{timestamp}.csv");
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

    [HttpPost("export-logging-data")]
    public async Task<IActionResult> ExportLoggingData(
        [FromBody] ExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting logging data with modules: {Modules}", string.Join(", ", request.Modules));
            var excelBytes = await _reportService.ExportLoggingDataAsync(request.Modules, request.StartDate, request.EndDate);
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"logging_data_{timestamp}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting logging data");
            return StatusCode(500, new ApiResponseDto
            {
                Success = false,
                Message = "Error exporting logging data",
                StatusCode = 500
            });
        }
    }
}

public class ExportRequest
{
    public List<string> Modules { get; set; } = new();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
