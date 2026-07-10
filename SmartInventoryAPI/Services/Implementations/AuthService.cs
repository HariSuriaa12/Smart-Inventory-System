using SmartInventoryAPI.Models.DTOs.Request.Auth;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;
using SmartInventoryAPI.Utilities.Helpers;

namespace SmartInventoryAPI.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUnitOfWork unitOfWork, IJwtTokenService jwtTokenService, ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            throw new BadRequestException("Username and password are required");

        var user = await _unitOfWork.User.GetByUsernameAsync(request.Username);
        if (user == null)
            throw new UnauthorizedException("Invalid credentials");

        //if (!PasswordHelper.VerifyPassword(request.Password.Trim(), user.Password!.Trim()))
        //    throw new UnauthorizedException("Invalid credentials");

        if(request.Password != user.Password)
            throw new UnauthorizedException("Invalid credentials");

        if (user.Is_Deleted)
            throw new UnauthorizedException("User account is disabled");

        var token = _jwtTokenService.GenerateToken(user);
        var expiresAt = _jwtTokenService.GetTokenExpirationTime();

        _logger.LogInformation("User {Username} logged in successfully", user.Username);

        return new AuthResponseDto
        {
            UserID = user.ID,
            Username = user.Username,
            Full_Name = user.Full_Name,
            Email = user.Email,
            Token = token,
            Role = user.Role,
            ExpiresAt = expiresAt
        };
    }
}
