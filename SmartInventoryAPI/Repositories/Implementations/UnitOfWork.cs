using SmartInventoryAPI.Data;
using SmartInventoryAPI.Repositories.Interfaces;

namespace SmartInventoryAPI.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly SmartInventoryDbContext _context;
    private IUserRepository? _userRepository;
    private IItemRepository? _itemRepository;
    private ILocationRepository? _locationRepository;
    private IVendorRepository? _vendorRepository;
    private ICustomerRepository? _customerRepository;
    private IInventoryRepository? _inventoryRepository;
    private IPurchaseOrderRepository? _purchaseOrderRepository;
    private IOrderFulfillmentRepository? _orderFulfillmentRepository;
    private ISalesRepository? _salesRepository;
    private IStockTransferRepository? _stockTransferRepository;
    private IPerformLogRepository? _performLogRepository;
    private IPriceLogRepository? _priceLogRepository;
    private IInventoryLogRepository? _inventoryLogRepository;

    public UnitOfWork(SmartInventoryDbContext context)
    {
        _context = context;
    }

    public IUserRepository User => _userRepository ??= new UserRepository(_context);
    public IItemRepository Items => _itemRepository ??= new ItemRepository(_context);
    public ILocationRepository Locations => _locationRepository ??= new LocationRepository(_context);
    public IVendorRepository Vendors => _vendorRepository ??= new VendorRepository(_context);
    public ICustomerRepository Customers => _customerRepository ??= new CustomerRepository(_context);
    public IInventoryRepository Inventories => _inventoryRepository ??= new InventoryRepository(_context);
    public IPurchaseOrderRepository PurchaseOrders => _purchaseOrderRepository ??= new PurchaseOrderRepository(_context);
    public IOrderFulfillmentRepository OrderFulfillments => _orderFulfillmentRepository ??= new OrderFulfillmentRepository(_context);
    public ISalesRepository Sales => _salesRepository ??= new SalesRepository(_context);
    public IStockTransferRepository StockTransfers => _stockTransferRepository ??= new StockTransferRepository(_context);
    public IPerformLogRepository PerformLogs => _performLogRepository ??= new LoggingService(_context);
    public IPriceLogRepository PriceLogs => _priceLogRepository ??= new PriceLogRepository(_context);
    public IInventoryLogRepository InventoryLogs => _inventoryLogRepository ??= new InventoryLogRepository(_context);

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context?.Dispose();
        GC.SuppressFinalize(this);
    }
}
