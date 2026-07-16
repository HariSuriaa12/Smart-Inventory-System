namespace SmartInventoryAPI.Services.Interfaces;

public interface ILoggingService
{
    Task LogPerformanceAsync(long performedBy, long performedOutlet, int performModule, int operationType,
        string performRemark, long operationId);

    Task LogPriceChangeAsync(long itemId, decimal previousPrice, decimal newPrice, long performLogId);

    //Task LogInventoryChangeAsync(long itemId, long locationId, decimal previousOnhand, decimal newOnhand,
    //    decimal previousAvailable, decimal newAvailable, long performLogId);

    Task LogInventoryChangeAsync(long itemId, long locationId, decimal onhandMovement, decimal availableMovement, long performLogId);

}
