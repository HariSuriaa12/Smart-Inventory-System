using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.RolePermission;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolePermissionsController : ControllerBase
{
    private readonly IRolePermissionService _rolePermissionService;
    private readonly ILogger<RolePermissionsController> _logger;

    public RolePermissionsController(IRolePermissionService rolePermissionService, ILogger<RolePermissionsController> logger)
    {
        _rolePermissionService = rolePermissionService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<PaginatedResponseDto<RolePermissionDto>>>> GetAllRolePermissions(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var rolePermissions = await _rolePermissionService.GetAllRolePermissionsAsync(skip, take);
        return Ok(new ApiResponseDto<PaginatedResponseDto<RolePermissionDto>>
        {
            Success = true,
            Message = "Role permissions retrieved successfully",
            Data = rolePermissions,
            StatusCode = 200
        });
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<RolePermissionDto>>>> GetActiveRoles()
    {
        var activeRoles = await _rolePermissionService.GetActiveRolesAsync();
        return Ok(new ApiResponseDto<IEnumerable<RolePermissionDto>>
        {
            Success = true,
            Message = "Active roles retrieved successfully",
            Data = activeRoles,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<RolePermissionDto>>> GetRolePermissionById(int id)
    {
        var rolePermission = await _rolePermissionService.GetRolePermissionByIdAsync(id);
        return Ok(new ApiResponseDto<RolePermissionDto>
        {
            Success = true,
            Message = "Role permission retrieved successfully",
            Data = rolePermission,
            StatusCode = 200
        });
    }

    [HttpGet("role/{roleId}")]
    public async Task<ActionResult<ApiResponseDto<RolePermissionDto>>> GetRolePermissionByRoleId(int roleId)
    {
        var rolePermission = await _rolePermissionService.GetRolePermissionByRoleIdAsync(roleId);
        return Ok(new ApiResponseDto<RolePermissionDto>
        {
            Success = true,
            Message = "Role permission retrieved successfully",
            Data = rolePermission,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<RolePermissionDto>>> CreateRolePermission(
        [FromBody] CreateRolePermissionRequestDto request)
    {
        var rolePermission = await _rolePermissionService.CreateRolePermissionAsync(request);
        return CreatedAtAction(nameof(GetRolePermissionById), new { id = rolePermission.ID },
            new ApiResponseDto<RolePermissionDto>
            {
                Success = true,
                Message = "Role permission created successfully",
                Data = rolePermission,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<RolePermissionDto>>> UpdateRolePermission(
        int id,
        [FromBody] UpdateRolePermissionRequestDto request)
    {
        var rolePermission = await _rolePermissionService.UpdateRolePermissionAsync(id, request);
        return Ok(new ApiResponseDto<RolePermissionDto>
        {
            Success = true,
            Message = "Role permission updated successfully",
            Data = rolePermission,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteRolePermission(int id)
    {
        await _rolePermissionService.DeleteRolePermissionAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Role permission deleted successfully",
            StatusCode = 200
        });
    }

    [HttpGet("{roleId}/can-delete")]
    public async Task<ActionResult<ApiResponseDto<bool>>> CanDeleteRole(int roleId)
    {
        var canDelete = await _rolePermissionService.CanDeleteRoleAsync(roleId);
        return Ok(new ApiResponseDto<bool>
        {
            Success = true,
            Message = canDelete ? "Role can be deleted" : "Role cannot be deleted because users are assigned to it",
            Data = canDelete,
            StatusCode = 200
        });
    }
}
