namespace SmartInventoryAPI.Models.DTOs.Request.User;

public class CreateUserRequestDto
{
    public string? FullName { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public int Role { get; set; }
    public string? Email { get; set; }
    public string? MobileNo { get; set; }
    public string? IC { get; set; }
    public string? StaffCode { get; set; }
}

public class UpdateUserRequestDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? MobileNo { get; set; }
    public int Role { get; set; }
}
