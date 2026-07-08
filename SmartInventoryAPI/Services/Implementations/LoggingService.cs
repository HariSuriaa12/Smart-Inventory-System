using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Services.Implementations;

public class LoggingService : ILoggingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<LoggingService> _logger;

    public LoggingService(IUnitOfWork unitOfWork, ILogger<LoggingService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task LogPerformanceAsync(long performedBy, long performedOutlet, int performModule,
        int operationType, string performRemark, long operationId)
    {
        try
        {
            var performLog = new PerformLog
            {
                PerformedBy = performedBy,
                PerformedOutlet = performedOutlet,
                PerformModule = performModule,
                OperationType = operationType,
                PerformRemark = performRemark,
                PerformDate = DateTime.UtcNow,
                OperationID = operationId
            };

            await _unitOfWork.SaveAsync();
            _logger.LogInformation("Performance logged: Module {Module}, Operation {Operation}, ID {OperationId}",
                performModule, operationType, operationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log performance operation");
        }
    }

    public async Task LogPriceChangeAsync(long itemId, decimal previousPrice, decimal newPrice, long performLogId)
    {
        try
        {
            var priceLog = new PriceLog
            {
                ItemID = itemId,
                PreviousUnitPrice = previousPrice,
                NewUnitPrice = newPrice,
                PerformedLogID = performLogId
            };

            await _unitOfWork.SaveAsync();
            _logger.LogInformation("Price change logged: Item {ItemId}, {OldPrice} -> {NewPrice}",
                itemId, previousPrice, newPrice);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log price change for item {ItemId}", itemId);
        }
    }

    public async Task LogInventoryChangeAsync(long itemId, long locationId, decimal previousOnhand,
        decimal newOnhand, decimal previousAvailable, decimal newAvailable, long performLogId)
    {
        try
        {
            var inventoryLog = new InventoryLog
            {
                ItemID = itemId,
                LocationID = locationId,
                PreviousOnhandQuantity = previousOnhand,
                NewOnhandQuantity = newOnhand,
                PreviousAvailableQuantity = previousAvailable,
                NewAvailableQuantity = newAvailable,
                PerformedLogID = performLogId
            };

            await _unitOfWork.SaveAsync();
            _logger.LogInformation("Inventory change logged: Item {ItemId}, Location {LocationId}, {OldQty} -> {NewQty}",
                itemId, locationId, previousOnhand, newOnhand);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log inventory change for item {ItemId}, location {LocationId}",
                itemId, locationId);
        }
    }
}
