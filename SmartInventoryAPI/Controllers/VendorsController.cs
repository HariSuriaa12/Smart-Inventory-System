using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Vendor;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<VendorsController> _logger;

    public VendorsController(IVendorService vendorService, ILogger<VendorsController> logger)
    {
        _vendorService = vendorService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<VendorDto>>>> GetAllVendors(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var vendors = await _vendorService.GetAllVendorsAsync(skip, take);
        return Ok(new ApiResponseDto<PaginatedResponseDto<VendorDto>>
        {
            Success = true,
            Message = "Vendors retrieved successfully",
            Data = vendors,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<VendorDto>>> GetVendorById(long id)
    {
        var vendor = await _vendorService.GetVendorByIdAsync(id);
        return Ok(new ApiResponseDto<VendorDto>
        {
            Success = true,
            Message = "Vendor retrieved successfully",
            Data = vendor,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<VendorDto>>> CreateVendor([FromBody] CreateVendorRequestDto request)
    {
        var vendor = await _vendorService.CreateVendorAsync(request);
        return CreatedAtAction(nameof(GetVendorById), new { id = vendor.ID },
            new ApiResponseDto<VendorDto>
            {
                Success = true,
                Message = "Vendor created successfully",
                Data = vendor,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<VendorDto>>> UpdateVendor(
        long id,
        [FromBody] UpdateVendorRequestDto request)
    {
        var vendor = await _vendorService.UpdateVendorAsync(id, request);
        return Ok(new ApiResponseDto<VendorDto>
        {
            Success = true,
            Message = "Vendor updated successfully",
            Data = vendor,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteVendor(long id)
    {
        await _vendorService.DeleteVendorAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Vendor deleted successfully",
            StatusCode = 200
        });
    }
}
