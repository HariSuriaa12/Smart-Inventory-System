using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IRolePermissionRepository : IGenericRepository<RolePermission>
{
    Task<RolePermission?> GetByRoleNameAsync(string roleName);
    Task<RolePermission?> GetByRoleIdAsync(int roleId);
    Task<IEnumerable<RolePermission>> GetActiveRolesAsync();
    Task<int> CountUsersWithRoleAsync(int id);
}
