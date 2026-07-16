using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.StockTransfer;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class StockTransferService : IStockTransferService
{
    private const int StatusShipped = 0;
    private const int StatusPartiallyReceived = 1;
    private const int StatusReceived = 2;
    private const int StatusCancelled = 3;

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

    public async Task<StockTransferDto> ReceiveStockAsync(long id, ReceiveStockRequestDto request)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Stock transfer with ID {id} not found");

        if (transfer.Is_Deleted)
            throw new InvalidOperationException("Cannot receive a deleted stock transfer");

        if (transfer.Status == StatusCancelled)
            throw new InvalidOperationException("Cannot receive a cancelled stock transfer");

        if (transfer.Status == StatusReceived)
            throw new InvalidOperationException("Stock transfer is already fully received");

        decimal totalReceived = transfer.Received_Quantity + request.ReceivedQuantity;
        if (totalReceived > transfer.Transfer_Quantity)
            throw new InvalidOperationException($"Received quantity cannot exceed transfer quantity ({transfer.Transfer_Quantity})");

        transfer.Received_Quantity = totalReceived;
        transfer.Status = totalReceived >= transfer.Transfer_Quantity ? StatusReceived : StatusPartiallyReceived;
        if (!string.IsNullOrWhiteSpace(request.Remark))
            transfer.Remark = request.Remark;

        _unitOfWork.StockTransfers.Update(transfer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation($"Stock transfer {id} received {request.ReceivedQuantity} units. Total received: {totalReceived}");

        return _mapper.Map<StockTransferDto>(transfer);
    }

    public async Task<StockTransferDto> CancelStockTransferAsync(long id, CancelStockTransferRequestDto request)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Stock transfer with ID {id} not found");

        if (transfer.Is_Deleted)
            throw new InvalidOperationException("Cannot cancel a deleted stock transfer");

        if (transfer.Status == StatusCancelled)
            throw new InvalidOperationException("Stock transfer is already cancelled");

        if (transfer.Status == StatusReceived)
            throw new InvalidOperationException("Cannot cancel a fully received stock transfer");

        transfer.Status = StatusCancelled;
        if (!string.IsNullOrWhiteSpace(request.Remark))
            transfer.Remark = request.Remark;

        _unitOfWork.StockTransfers.Update(transfer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation($"Stock transfer {id} cancelled");

        return _mapper.Map<StockTransferDto>(transfer);
    }

    public async Task<StockTransferDto> CancelStockTransferWithReturnAsync(long id, CancelStockTransferRequestDto request)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Stock transfer with ID {id} not found");

        if (transfer.Is_Deleted)
            throw new InvalidOperationException("Cannot cancel a deleted stock transfer");

        if (transfer.Status == StatusCancelled)
            throw new InvalidOperationException("Stock transfer is already cancelled");

        if (transfer.Status == StatusShipped)
            throw new InvalidOperationException("Cannot cancel with return when transfer is still in shipped status");

        decimal returnQuantity = transfer.Received_Quantity;
        transfer.Status = StatusCancelled;
        transfer.Received_Quantity = 0;
        if (!string.IsNullOrWhiteSpace(request.Remark))
            transfer.Remark = request.Remark;

        _unitOfWork.StockTransfers.Update(transfer);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation($"Stock transfer {id} cancelled with return of {returnQuantity} units");

        return _mapper.Map<StockTransferDto>(transfer);
    }
}
