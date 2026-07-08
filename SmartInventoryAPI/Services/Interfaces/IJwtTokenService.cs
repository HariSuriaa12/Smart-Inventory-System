using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Services.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    DateTime GetTokenExpirationTime();
}
