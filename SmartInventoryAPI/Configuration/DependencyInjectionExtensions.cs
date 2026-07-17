using SmartInventoryAPI.Repositories.Implementations;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Implementations;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Configuration;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<IVendorRepository, VendorRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        services.AddScoped<IOrderFulfillmentRepository, OrderFulfillmentRepository>();
        services.AddScoped<ISalesRepository, SalesRepository>();
        services.AddScoped<IStockTransferRepository, StockTransferRepository>();
        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();

        // Register services
        services.AddScoped<ILoggingService, LoggingService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IItemService, ItemService>();
        services.AddScoped<ILocationService, LocationService>();
        services.AddScoped<IVendorService, VendorService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
        services.AddScoped<IOrderFulfillmentService, OrderFulfillmentService>();
        services.AddScoped<ISalesService, SalesService>();
        services.AddScoped<IStockTransferService, StockTransferService>();
        services.AddScoped<IRolePermissionService, RolePermissionService>();

        return services;
    }
}
