namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
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

    Task SaveAsync();
}
