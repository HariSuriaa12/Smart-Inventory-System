namespace SmartInventoryAPI.Models.DTOs.Response;

public class UserDto
{
    public long ID { get; set; }
    public string? Full_Name { get; set; }
    public string? Username { get; set; }
    public int Role { get; set; }
    public DateTime Creation_Date { get; set; }
    public string? IC { get; set; }
    public string? Mobile_No { get; set; }
    public string? Email { get; set; }
    public string? Staff_Code { get; set; }
}
