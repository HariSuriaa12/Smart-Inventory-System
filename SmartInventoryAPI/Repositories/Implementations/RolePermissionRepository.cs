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

    public async Task<RolePermission?> GetByRoleIdAsync(int roleId)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.Role_ID == roleId);
    }

    public async Task<IEnumerable<RolePermission>> GetActiveRolesAsync()
    {
        return await _dbSet.Where(r => r.Is_Active).ToListAsync();
    }

    public async Task<int> CountUsersWithRoleAsync(int roleId)
    {
        return await _context.User.CountAsync(u => u.Role == roleId && !u.Is_Deleted);
    }
}
