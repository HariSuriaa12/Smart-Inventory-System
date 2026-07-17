using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class RolePermissionRepository : GenericRepository<RolePermission>, IRolePermissionRepository
{
    public RolePermissionRepository(SmartInventoryDbContext context) : base(context)
    {
    }
    public async Task<RolePermission?> GetByRoleNameAsync(string roleName)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.role_name.Trim().ToLower() == roleName.Trim().ToLower());
    }
    public async Task<RolePermission?> GetByRoleIdAsync(int roleId)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.role_id == roleId);
    }

    public async Task<IEnumerable<RolePermission>> GetActiveRolesAsync()
    {
        return await _dbSet.Where(r => r.is_active).ToListAsync();
    }

    public async Task<int> CountUsersWithRoleAsync(int id)
    {
        return await _context.User.CountAsync(u => u.Role == id && !u.Is_Deleted);
    }
}
