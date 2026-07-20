using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Username == username && !u.Is_Deleted);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email && !u.Is_Deleted);
    }

    public async Task<IEnumerable<User>> GetActiveUsersAsync(int skip = 0, int take = 10)
    {
        return await _dbSet.Where(u => !u.Is_Deleted)
            .Include(p => p.Role_Permission)
            //.ThenInclude(i => i.Item)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountNonDeletedAsync()
    {
        return await _dbSet.Where(i => !i.Is_Deleted).CountAsync();
    }
}
