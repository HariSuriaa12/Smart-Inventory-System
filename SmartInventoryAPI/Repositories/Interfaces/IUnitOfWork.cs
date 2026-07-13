using SmartInventoryAPI.Data;
using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    SmartInventoryDbContext Context { get; }
    IUserRepository User { get; }
    IItemRepository Items { get; }
    ILocationRepository Locations { get; }
    IVendorRepository Vendors { get; }
    ICustomerRepository Customers { get; }
    IInventoryRepository Inventories { get; }
    IPurchaseOrderRepository PurchaseOrders { get; }
    IOrderFulfillmentRepository OrderFulfillments { get; }
    ISalesRepository Sales { get; }
    IStockTransferRepository StockTransfers { get; }
    IGenericRepository<PerformLog> PerformLogs { get; }
    IGenericRepository<PriceLog> PriceLogs { get; }
    IGenericRepository<InventoryLog> InventoryLogs { get; }

    Task SaveAsync();
}
