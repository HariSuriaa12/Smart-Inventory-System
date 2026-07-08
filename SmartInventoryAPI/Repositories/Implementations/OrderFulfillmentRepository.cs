using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class OrderFulfillmentRepository : GenericRepository<OrderFulfillmentHeader>, IOrderFulfillmentRepository
{
    public OrderFulfillmentRepository(SmartInventoryDbContext context) : base(context)
    {
    }

    public async Task<OrderFulfillmentHeader?> GetWithItemsAsync(long id)
    {
        return await _dbSet.Include(o => o.Items)
            .ThenInclude(i => i.Item)
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.ID == id && !o.IsDeleted);
    }

    public async Task<IEnumerable<OrderFulfillmentHeader>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(o => o.CustomerID == customerId && !o.IsDeleted)
            .Include(o => o.Customer)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrderFulfillmentHeader>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(o => o.LocationID == locationId && !o.IsDeleted)
            .Include(o => o.Customer)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrderFulfillmentHeader>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(o => o.Status == status && !o.IsDeleted)
            .Include(o => o.Customer)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
