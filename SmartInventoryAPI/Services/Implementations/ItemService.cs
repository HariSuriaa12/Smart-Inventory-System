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
        item.Is_Active = true;
        item.Creation_Date = DateTime.UtcNow;

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

    public async Task<IEnumerable<ItemDto>> GetAllItemsAsync(int skip = 0, int take = 10)
    {
        var items = await _unitOfWork.Items.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<ItemDto>>(items.Where(i => !i.Is_Deleted));
    }

    public async Task<ItemDto> UpdateItemAsync(long id, UpdateItemRequestDto request)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(id);
        if (item == null || item.Is_Deleted)
            throw new NotFoundException("Item not found");

        var previousPrice = item.Unit_Cost;
        _mapper.Map(request, item);
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

    public async Task<IEnumerable<ItemDto>> GetByCategoryAsync(string category, int skip = 0, int take = 10)
    {
        var items = await _unitOfWork.Items.GetByCategoryAsync(category, skip, take);
        return _mapper.Map<IEnumerable<ItemDto>>(items);
    }
}
