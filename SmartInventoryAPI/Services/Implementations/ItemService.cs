using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Item;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class ItemService : IItemService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ItemService> _logger;
    private readonly ILoggingService _loggingService;

    public ItemService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ItemService> logger, ILoggingService loggingService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _loggingService = loggingService;
    }

    public async Task<ItemDto> CreateItemAsync(CreateItemRequestDto request)
    {
        var item = _mapper.Map<Item>(request);
        //item.Is_Active = true;
        item.Creation_Date = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

        var createdItem = await _unitOfWork.Items.AddAsync(item);
        await _unitOfWork.SaveAsync();

        // Log the creation
        await _loggingService.LogPerformanceAsync(
            performedBy: 1, // Current user ID
            performedOutlet: 1, // Current outlet
            performModule: 1, // Item module
            operationType: 1, // Create operation
            performRemark: $"Created item: {item.Item_Code}",
            operationId: createdItem.ID);

        _logger.LogInformation("Item {ItemCode} created successfully", item.Item_Code);
        return _mapper.Map<ItemDto>(createdItem);
    }

    public async Task<ItemDto> GetItemByIdAsync(long id)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(id);
        if (item == null || item.Is_Deleted)
            throw new NotFoundException("Item not found");

        return _mapper.Map<ItemDto>(item);
    }

    public async Task<PaginatedResponseDto<ItemDto>> GetAllItemsAsync(int skip = 0, int take = 10, string? searchQuery = null)
    {
        IEnumerable<Item> items;
        int total;

        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            items = await _unitOfWork.Items.SearchAsync(searchQuery, skip, take);
            total = await _unitOfWork.Items.CountSearchAsync(searchQuery);
        }
        else
        {
            items = await _unitOfWork.Items.GetAllAsync(skip, take);
            total = await _unitOfWork.Items.CountNonDeletedAsync();
        }

        var activeItems = items.Where(i => !i.Is_Deleted).ToList();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<ItemDto>
        {
            Data = _mapper.Map<IEnumerable<ItemDto>>(activeItems),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<ItemDto> UpdateItemAsync(long id, UpdateItemRequestDto request)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(id);
        if (item == null || item.Is_Deleted)
            throw new NotFoundException("Item not found");

        var previousPrice = item.Unit_Cost;
        _mapper.Map(request, item);

        // Ensure DateTime is UTC kind
        if (item.Creation_Date.Kind == DateTimeKind.Unspecified)
        {
            item.Creation_Date = DateTime.SpecifyKind(item.Creation_Date, DateTimeKind.Utc);
        }

        await _unitOfWork.Items.UpdateAsync(item);
        await _unitOfWork.SaveAsync();

        // Log price change if unit cost changed
        if (previousPrice != item.Unit_Cost)
        {
            await _loggingService.LogPerformanceAsync(
                performedBy: 1,
                performedOutlet: 1,
                performModule: 1, // Item module
                operationType: 2, // Update operation
                performRemark: $"Updated item {item.Item_Code}, price changed from {previousPrice} to {item.Unit_Cost}",
                operationId: id);

            await _loggingService.LogPriceChangeAsync(id, previousPrice, item.Unit_Cost, id);
        }
        else
        {
            // Log regular update
            await _loggingService.LogPerformanceAsync(
                performedBy: 1,
                performedOutlet: 1,
                performModule: 1,
                operationType: 2,
                performRemark: $"Updated item: {item.Item_Code}",
                operationId: id);
        }

        _logger.LogInformation("Item {ID} updated successfully", id);
        return _mapper.Map<ItemDto>(item);
    }

    public async Task DeleteItemAsync(long id)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(id);
        if (item == null)
            throw new NotFoundException("Item not found");

        item.Is_Deleted = true;
        // Ensure deletion timestamp is UTC
        if (item.Creation_Date.Kind == DateTimeKind.Unspecified)
        {
            item.Creation_Date = DateTime.SpecifyKind(item.Creation_Date, DateTimeKind.Utc);
        }

        await _unitOfWork.Items.UpdateAsync(item);
        await _unitOfWork.SaveAsync();

        // Log deletion
        await _loggingService.LogPerformanceAsync(
            performedBy: 1,
            performedOutlet: 1,
            performModule: 1,
            operationType: 3, // Delete operation
            performRemark: $"Deleted item: {item.Item_Code}",
            operationId: id);

        _logger.LogInformation("Item {ID} deleted successfully", id);
    }

    public async Task<PaginatedResponseDto<ItemDto>> GetByCategoryAsync(string category, int skip = 0, int take = 10)
    {
        var items = await _unitOfWork.Items.GetByCategoryAsync(category, skip, take);
        var total = await _unitOfWork.Items.CountByCategoryAsync(category);

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<ItemDto>
        {
            Data = _mapper.Map<IEnumerable<ItemDto>>(items),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }
}
