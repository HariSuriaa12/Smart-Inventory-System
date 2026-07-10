using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class StockTransferService : IStockTransferService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StockTransferService> _logger;

    public StockTransferService(IUnitOfWork unitOfWork, ILogger<StockTransferService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<object>> GetAllStockTransfersAsync(int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetAllAsync(skip, take);
        return transfers.Where(t => !t.Is_Deleted).Select(t => new
        {
            t.ID,
            t.Item_ID,
            t.From_Location_ID,
            t.To_Location_ID,
            t.Transfer_Quantity,
            t.Transfer_Date,
            t.Status,
            t.Remark
        }).AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByFromLocationAsync(locationId, skip, take);
        return transfers.Select(t => new
        {
            t.ID,
            t.Item_ID,
            t.From_Location_ID,
            t.To_Location_ID,
            t.Transfer_Quantity,
            t.Transfer_Date,
            t.Status,
            t.Remark
        }).AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByToLocationAsync(locationId, skip, take);
        return transfers.Select(t => new
        {
            t.ID,
            t.Item_ID,
            t.From_Location_ID,
            t.To_Location_ID,
            t.Transfer_Quantity,
            t.Transfer_Date,
            t.Status,
            t.Remark
        }).AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByStatusAsync(status, skip, take);
        return transfers.Select(t => new
        {
            t.ID,
            t.Item_ID,
            t.From_Location_ID,
            t.To_Location_ID,
            t.Transfer_Quantity,
            t.Transfer_Date,
            t.Status,
            t.Remark
        }).AsEnumerable<object>();
    }
}
