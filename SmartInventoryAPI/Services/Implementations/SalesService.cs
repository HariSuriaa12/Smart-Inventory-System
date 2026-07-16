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
        var location = await _unitOfWork.Locations.GetByIdAsync(request.Location_ID);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        var sales = new Sales
        {
            Location_ID = request.Location_ID,
            Sales_Date = request.Sales_Date,
            Sales_Time = DateTime.UtcNow.TimeOfDay,
            Sales_Number = request.Sales_Number,
            Sales_Status = request.Sales_Status,
            Is_Reserved = false
        };

        var createdSales = await _unitOfWork.Sales.AddAsync(sales);

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                var salesItem = new SalesItem
                {
                    Sales_ID = createdSales.ID,
                    Item_ID = item.Item_ID,
                    Sold_Quantity = item.Sold_Quantity,
                    Sub_Total = item.Sold_Quantity * item.Unit_Price,
                    Is_Promotion = item.Is_Promotion,
                    Discount_Percentage = item.Discount_Percentage
                };
                await _unitOfWork.Sales.AddAsync(createdSales);
            }
        }

        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Sales {SalesNumber} received from Location {LocationID}", request.Sales_Number, request.Location_ID);

        return await GetSalesByIdAsync(createdSales.ID);
    }

    public async Task<SalesDetailDto> GetSalesByIdAsync(long id)
    {
        var sales = await _unitOfWork.Sales.GetWithItemsAsync(id);
        if (sales == null || sales.Is_Deleted)
            throw new NotFoundException("Sales record not found");

        return _mapper.Map<SalesDetailDto>(sales);
    }

    public async Task<IEnumerable<SalesDto>> GetAllSalesAsync(int skip = 0, int take = 10)
    {
        var sales = await _unitOfWork.Sales.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<SalesDto>>(sales.Where(s => !s.Is_Deleted));
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

    public async Task<PaginatedResponseDto<SalesDto>> GetAllSalesFilteredAsync(
        int skip = 0, int take = 10, long? salesId = null, string? salesNumber = null,
        int? status = null, string? dateFrom = null, string? dateTo = null)
    {
        var total = await _unitOfWork.Sales.CountFilteredAsync(salesId, salesNumber, status, dateFrom, dateTo);
        var sales = await _unitOfWork.Sales.GetFilteredAsync(salesId, salesNumber, status, dateFrom, dateTo, skip, take);

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<SalesDto>
        {
            Data = _mapper.Map<IEnumerable<SalesDto>>(sales),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<IEnumerable<dynamic>> GetTopSellingItemsByLocationAsync(long locationId, int skip = 0, int take = 10)
    {
        var sales = await _unitOfWork.Sales.GetByLocationAsync(locationId, 0, 1000);

        var groupedByItem = sales
            .Where(s => s.Items != null)
            .SelectMany(s => s.Items.Select(si => new { s.ID, si.Item_ID, si.Item, si.Sold_Quantity, si.Sub_Total }))
            .GroupBy(x => x.Item_ID)
            .Select(g => new
            {
                itemId = g.Key,
                itemCode = g.First().Item?.Item_Code ?? "",
                itemName = g.First().Item?.Item_Name ?? "",
                totalQty = g.Sum(x => x.Sold_Quantity),
                totalValue = g.Sum(x => x.Sub_Total),
                averagePrice = g.Average(x => x.Sub_Total / (x.Sold_Quantity > 0 ? x.Sold_Quantity : 1))
            })
            .OrderByDescending(x => x.totalValue)
            .Skip(skip)
            .Take(take)
            .ToList<dynamic>();

        return groupedByItem;
    }
}
