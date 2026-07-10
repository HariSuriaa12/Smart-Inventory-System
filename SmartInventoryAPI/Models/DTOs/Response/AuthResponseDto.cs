namespace SmartInventoryAPI.Models.DTOs.Response;

public class AuthResponseDto
{
    public long UserID { get; set; }
    public string? Username { get; set; }
    public string? Full_Name { get; set; }
    public string? Email { get; set; }
    public string? Token { get; set; }
    public int Role { get; set; }
    public DateTime ExpiresAt { get; set; }
}
