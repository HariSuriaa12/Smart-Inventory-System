namespace SmartInventoryAPI.Services.Interfaces;

public interface IReportService
{
    Task<byte[]> ExportMasterDataAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportTransactionalDataAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportAllDataAsync(DateTime? startDate = null, DateTime? endDate = null);
}
