using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Sales;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class SalesService : ISalesService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<SalesService> _logger;

    public SalesService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<SalesService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<SalesDetailDto> ReceiveSalesAsync(ReceiveSalesRequestDto request)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationID);
        if (location == null || location.IsDeleted)
            throw new NotFoundException("Location not found");

        var sales = new Sales
        {
            LocationID = request.LocationID,
            SalesDate = request.SalesDate,
            SalesTime = DateTime.UtcNow.TimeOfDay,
            SalesNumber = request.SalesNumber,
            SalesStatus = request.SalesStatus,
            IsReserved = false
        };

        var createdSales = await _unitOfWork.Sales.AddAsync(sales);

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                var salesItem = new SalesItem
                {
                    SalesID = createdSales.ID,
                    ItemID = item.ItemID,
                    SoldQuantity = item.SoldQuantity,
                    SubTotal = item.SoldQuantity * item.UnitPrice,
                    IsPromotion = item.IsPromotion,
                    DiscountPercentage = item.DiscountPercentage
                };
                await _unitOfWork.Sales.AddAsync(createdSales);
            }
        }

        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Sales {SalesNumber} received from Location {LocationID}", request.SalesNumber, request.LocationID);

        return await GetSalesByIdAsync(createdSales.ID);
    }

    public async Task<SalesDetailDto> GetSalesByIdAsync(long id)
    {
        var sales = await _unitOfWork.Sales.GetWithItemsAsync(id);
        if (sales == null || sales.IsDeleted)
            throw new NotFoundException("Sales record not found");

        return _mapper.Map<SalesDetailDto>(sales);
    }

    public async Task<IEnumerable<SalesDto>> GetAllSalesAsync(int skip = 0, int take = 10)
    {
        var sales = await _unitOfWork.Sales.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<SalesDto>>(sales.Where(s => !s.IsDeleted));
    }

    public async Task<IEnumerable<SalesDto>> GetByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var sales = await _unitOfWork.Sales.GetByLocationAsync(locationId, skip, take);
        return _mapper.Map<IEnumerable<SalesDto>>(sales);
    }

    public async Task<IEnumerable<SalesDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 10)
    {
        var sales = await _unitOfWork.Sales.GetByDateRangeAsync(startDate, endDate, skip, take);
        return _mapper.Map<IEnumerable<SalesDto>>(sales);
    }
}
