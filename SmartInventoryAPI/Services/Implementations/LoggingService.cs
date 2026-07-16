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

    public async Task<long> LogPerformanceAsync(long performedBy, long performedOutlet, int performModule,
        int operationType, string performRemark, long operationId)
    {
        try
        {
            var performLog = new PerformLog
            {
                Performed_By = performedBy,
                Performed_Outlet = performedOutlet,
                Perform_Module = performModule,
                Operation_Type = operationType,
                Perform_Remark = performRemark,
                Perform_Date = DateTime.UtcNow,
                Operation_ID = operationId
            };

            await _unitOfWork.PerformLogs.AddAsync(performLog);
            await _unitOfWork.SaveAsync();
            _logger.LogInformation("Performance logged: Module {Module}, Operation {Operation}, ID {OperationId}",
                performModule, operationType, operationId);
            return performLog.ID;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log performance operation");
            return 0;
        }
    }

    public async Task LogPriceChangeAsync(long itemId, decimal previousPrice, decimal newPrice, long performLogId)
    {
        try
        {
            var priceLog = new PriceLog
            {
                Item_ID = itemId,
                Previous_Unit_Price = previousPrice,
                New_Unit_Price = newPrice,
                Performed_Log_ID = performLogId
            };

            await _unitOfWork.PriceLogs.AddAsync(priceLog);
            await _unitOfWork.SaveAsync();
            _logger.LogInformation("Price change logged: Item {ItemId}, {OldPrice} -> {NewPrice}",
                itemId, previousPrice, newPrice);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log price change for item {ItemId}", itemId);
        }
    }

    public async Task LogInventoryChangeAsync(long itemId, long locationId, decimal onhandMovement, decimal availableMovement, long performLogId)
    {
        try
        {
            var inventoryLog = new InventoryLog
            {
                Item_ID = itemId,
                Location_ID = locationId,
                //Previous_Onhand_Quantity = previousOnhand,
                //New_Onhand_Quantity = newOnhand,
                //Previous_Available_Quantity = previousAvailable,
                //New_Available_Quantity = newAvailable,
                Onhand_Quantity_Movement = onhandMovement,
                Available_Quantity_Movement = availableMovement,
                Performed_Log_ID = performLogId
            };

            await _unitOfWork.InventoryLogs.AddAsync(inventoryLog);
            await _unitOfWork.SaveAsync();
            _logger.LogInformation("Inventory change logged: Item {ItemId}, Location {LocationId}, Onhand {OldQty}, Available {NewQty}",
                itemId, locationId, onhandMovement, availableMovement);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log inventory change for item {ItemId}, location {LocationId}",
                itemId, locationId);
        }
    }
}
