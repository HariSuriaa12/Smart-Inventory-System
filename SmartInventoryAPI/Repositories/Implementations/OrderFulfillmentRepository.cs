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
        return await _dbSet
            .Include(o => o.Customer)
            .Include(o => o.Location)
            .Include(o => o.Items)
            .ThenInclude(i => i.Item)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.ID == id && !o.Is_Deleted);

        //return await _dbSet.Include(o => o.Items)
        //    .ThenInclude(i => i.Item)
        //    .Include(o => o.Customer)
        //    .FirstOrDefaultAsync(o => o.ID == id && !o.Is_Deleted);
    }

    public async Task<IEnumerable<OrderFulfillmentHeader>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(o => o.Customer_ID == customerId && !o.Is_Deleted)
            .Include(o => o.Customer)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrderFulfillmentHeader>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(o => o.Location_ID == locationId && !o.Is_Deleted)
            .Include(o => o.Customer)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrderFulfillmentHeader>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        return await _dbSet.Where(o => o.Status == status && !o.Is_Deleted)
            .Include(o => o.Customer)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }
}
