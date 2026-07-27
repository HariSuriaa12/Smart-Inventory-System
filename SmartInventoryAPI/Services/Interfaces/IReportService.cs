namespace SmartInventoryAPI.Services.Interfaces;

public interface IReportService
{
    Task<byte[]> ExportMasterDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportTransactionalDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportLoggingDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
}
