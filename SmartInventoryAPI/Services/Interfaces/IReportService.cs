namespace SmartInventoryAPI.Services.Interfaces;

public interface IReportService
{
    Task<Dictionary<string, byte[]>> ExportDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportMasterDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
    Task<Dictionary<string, byte[]>> ExportTransactionalDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportLoggingDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null);
}
