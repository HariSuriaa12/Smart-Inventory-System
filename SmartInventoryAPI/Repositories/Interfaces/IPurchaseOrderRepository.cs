using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface IPurchaseOrderRepository : IGenericRepository<PurchaseOrderHeader>
{
    Task<PurchaseOrderHeader?> GetWithItemsAsync(long id);
    Task<IEnumerable<PurchaseOrderHeader>> GetByVendorAsync(long vendorId, int skip = 0, int take = 10);
    Task<IEnumerable<PurchaseOrderHeader>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<PurchaseOrderHeader>> GetByStatusAsync(int status, int skip = 0, int take = 10);
}
