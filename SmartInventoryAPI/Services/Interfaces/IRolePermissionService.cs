using SmartInventoryAPI.Models.DTOs.Request.RolePermission;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IRolePermissionService
{
    Task<RolePermissionDto> CreateRolePermissionAsync(CreateRolePermissionRequestDto request);
    Task<RolePermissionDto> GetRolePermissionByIdAsync(int id);
    Task<RolePermissionDto> GetRolePermissionByRoleIdAsync(int roleId);
    Task<PaginatedResponseDto<RolePermissionDto>> GetAllRolePermissionsAsync(int skip = 0, int take = 10);
    Task<IEnumerable<RolePermissionDto>> GetActiveRolesAsync();
    Task<RolePermissionDto> UpdateRolePermissionAsync(int id, UpdateRolePermissionRequestDto request);
    Task DeleteRolePermissionAsync(int id);
    Task<bool> CanDeleteRoleAsync(int roleId);
}
