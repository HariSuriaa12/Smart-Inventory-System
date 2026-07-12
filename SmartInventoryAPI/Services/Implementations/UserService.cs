using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.User;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;
using SmartInventoryAPI.Utilities.Helpers;

namespace SmartInventoryAPI.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequestDto request)
    {
        var existingUser = await _unitOfWork.User.GetByUsernameAsync(request.Username!);
        if (existingUser != null && !existingUser.Is_Deleted)
            throw new ConflictException("Username already exists");

        var user = _mapper.Map<User>(request);
        user.Password = PasswordHelper.HashPassword(request.Password!);
        user.Creation_Date = DateTime.UtcNow;

        var createdUser = await _unitOfWork.User.AddAsync(user);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("User {Username} created successfully", user.Username);

        return _mapper.Map<UserDto>(createdUser);
    }

    public async Task<UserDto> GetUserByIdAsync(long id)
    {
        var user = await _unitOfWork.User.GetByIdAsync(id);
        if (user == null || user.Is_Deleted)
            throw new NotFoundException("User not found");

        return _mapper.Map<UserDto>(user);
    }

    public async Task<PaginatedResponseDto<UserDto>> GetAllUsersAsync(int skip = 0, int take = 10)
    {
        var users = await _unitOfWork.User.GetActiveUsersAsync(skip, take);
        var total = await _unitOfWork.User.CountNonDeletedAsync();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<UserDto>
        {
            Data = _mapper.Map<IEnumerable<UserDto>>(users),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<UserDto> UpdateUserAsync(long id, UpdateUserRequestDto request)
    {
        var user = await _unitOfWork.User.GetByIdAsync(id);
        if (user == null || user.Is_Deleted)
            throw new NotFoundException("User not found");

        _mapper.Map(request, user);
        await _unitOfWork.User.UpdateAsync(user);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("User {ID} updated successfully", id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task DeleteUserAsync(long id)
    {
        var user = await _unitOfWork.User.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found");

        user.Is_Deleted = true;
        // Ensure deletion timestamp is UTC
        if (user.Creation_Date.Kind == DateTimeKind.Unspecified)
        {
            user.Creation_Date = DateTime.SpecifyKind(user.Creation_Date, DateTimeKind.Utc);
        }
        await _unitOfWork.User.UpdateAsync(user);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("User {ID} deleted successfully", id);
    }
}
