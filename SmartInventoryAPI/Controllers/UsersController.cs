using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.User;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<UserDto>>>> GetAllUsers(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var users = await _userService.GetAllUsersAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<UserDto>>
        {
            Success = true,
            Message = "Users retrieved successfully",
            Data = users,
            StatusCode = 200
        });
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<UserDto>>> GetUserById(long id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return Ok(new ApiResponseDto<UserDto>
        {
            Success = true,
            Message = "User retrieved successfully",
            Data = user,
            StatusCode = 200
        });
    }

    /// <summary>
    /// Create new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<UserDto>>> CreateUser([FromBody] CreateUserRequestDto request)
    {
        var user = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUserById), new { id = user.ID },
            new ApiResponseDto<UserDto>
            {
                Success = true,
                Message = "User created successfully",
                Data = user,
                StatusCode = 201
            });
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<UserDto>>> UpdateUser(
        long id,
        [FromBody] UpdateUserRequestDto request)
    {
        var user = await _userService.UpdateUserAsync(id, request);
        return Ok(new ApiResponseDto<UserDto>
        {
            Success = true,
            Message = "User updated successfully",
            Data = user,
            StatusCode = 200
        });
    }

    /// <summary>
    /// Delete user (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteUser(long id)
    {
        await _userService.DeleteUserAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "User deleted successfully",
            StatusCode = 200
        });
    }
}
