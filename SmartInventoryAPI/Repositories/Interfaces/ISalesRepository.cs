using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Repositories.Interfaces;

public interface ISalesRepository : IGenericRepository<Sales>
{
    Task<Sales?> GetWithItemsAsync(long id);
    Task<IEnumerable<Sales>> GetByLocationAsync(long locationId, int skip = 0, int take = 10);
    Task<IEnumerable<Sales>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 10);
    Task<IEnumerable<Sales>> GetByStatusAsync(int status, int skip = 0, int take = 10);
    Task<IEnumerable<Sales>> GetFilteredAsync(
        long? salesId = null, string? salesNumber = null, int? status = null,
        string? dateFrom = null, string? dateTo = null, int skip = 0, int take = 10);
    Task<int> CountFilteredAsync(
        long? salesId = null, string? salesNumber = null, int? status = null,
        string? dateFrom = null, string? dateTo = null);
}
