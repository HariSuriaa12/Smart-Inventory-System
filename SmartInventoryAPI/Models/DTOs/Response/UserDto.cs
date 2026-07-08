namespace SmartInventoryAPI.Models.DTOs.Response;

public class UserDto
{
    public long ID { get; set; }
    public string? FullName { get; set; }
    public string? Username { get; set; }
    public int Role { get; set; }
    public DateTime CreationDate { get; set; }
    public string? IC { get; set; }
    public string? MobileNo { get; set; }
    public string? Email { get; set; }
    public string? StaffCode { get; set; }
}
