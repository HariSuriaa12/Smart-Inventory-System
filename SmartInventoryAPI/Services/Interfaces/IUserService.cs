using SmartInventoryAPI.Models.DTOs.Request.User;
using SmartInventoryAPI.Models.DTOs.Response;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IUserService
{
    Task<UserDto> CreateUserAsync(CreateUserRequestDto request);
    Task<UserDto> GetUserByIdAsync(long id);
    Task<IEnumerable<UserDto>> GetAllUsersAsync(int skip = 0, int take = 10);
    Task<UserDto> UpdateUserAsync(long id, UpdateUserRequestDto request);
    Task DeleteUserAsync(long id);
}
