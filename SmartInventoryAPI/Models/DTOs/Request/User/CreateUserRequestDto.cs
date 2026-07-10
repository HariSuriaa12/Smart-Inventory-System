namespace SmartInventoryAPI.Models.DTOs.Request.User;

public class CreateUserRequestDto
{
    public string? Full_Name { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public int Role { get; set; }
    public string? Email { get; set; }
    public string? Mobile_No { get; set; }
    public string? IC { get; set; }
    public string? Staff_Code { get; set; }
}

public class UpdateUserRequestDto
{
    public string? Full_Name { get; set; }
    public string? Email { get; set; }
    public string? Mobile_No { get; set; }
    public int Role { get; set; }
}
