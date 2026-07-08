namespace SmartInventoryAPI.Models.DTOs.Response;

public class AuthResponseDto
{
    public long UserID { get; set; }
    public string? Username { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Token { get; set; }
    public int Role { get; set; }
    public DateTime ExpiresAt { get; set; }
}
