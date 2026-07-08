using SmartInventoryAPI.Models.DTOs.Request.Item;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IItemService
{
    Task<ItemDto> CreateItemAsync(CreateItemRequestDto request);
    Task<ItemDto> GetItemByIdAsync(long id);
    Task<IEnumerable<ItemDto>> GetAllItemsAsync(int skip = 0, int take = 10);
    Task<ItemDto> UpdateItemAsync(long id, UpdateItemRequestDto request);
    Task DeleteItemAsync(long id);
    Task<IEnumerable<ItemDto>> GetByCategoryAsync(string category, int skip = 0, int take = 10);
}
