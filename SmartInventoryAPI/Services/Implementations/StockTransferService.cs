using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class StockTransferService : IStockTransferService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StockTransferService> _logger;
    private readonly IMapper _mapper;

    public StockTransferService(IUnitOfWork unitOfWork, ILogger<StockTransferService> logger, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<PaginatedResponseDto<StockTransferDto>> GetAllStockTransfersAsync(int skip = 0, int take = 10)
    {
        var total = await _unitOfWork.StockTransfers.CountAsync();
        var transfers = await _unitOfWork.StockTransfers.GetAllWithDetailsAsync(skip, take);
        var activetransfers = transfers.Where(t => !t.Is_Deleted).ToList();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<StockTransferDto>
        {
            Data = _mapper.Map<IEnumerable<StockTransferDto>>(activetransfers),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<PaginatedResponseDto<StockTransferDto>> GetFilteredAsync(
        long? id = null, int? status = null, long? fromLocationId = null, long? toLocationId = null,
        long? itemId = null, string? dateFrom = null, string? dateTo = null,
        int skip = 0, int take = 10)
    {
        var total = await _unitOfWork.StockTransfers.CountFilteredAsync(id, status, fromLocationId, toLocationId, itemId, dateFrom, dateTo);
        var transfers = await _unitOfWork.StockTransfers.GetFilteredAsync(id, status, fromLocationId, toLocationId, itemId, dateFrom, dateTo, skip, take);

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<StockTransferDto>
        {
            Data = _mapper.Map<IEnumerable<StockTransferDto>>(transfers),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<IEnumerable<object>> GetByFromLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByFromLocationAsync(locationId, skip, take);
        return transfers
            .Select(t => _mapper.Map<StockTransferDto>(t))
            .AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByToLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByToLocationAsync(locationId, skip, take);
        return transfers
            .Select(t => _mapper.Map<StockTransferDto>(t))
            .AsEnumerable<object>();
    }

    public async Task<IEnumerable<object>> GetByStatusAsync(int status, int skip = 0, int take = 10)
    {
        var transfers = await _unitOfWork.StockTransfers.GetByStatusAsync(status, skip, take);
        return transfers
            .Select(t => _mapper.Map<StockTransferDto>(t))
            .AsEnumerable<object>();
    }
}
