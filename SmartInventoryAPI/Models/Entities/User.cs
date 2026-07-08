namespace SmartInventoryAPI.Models.Entities;

public class User
{
    public long ID { get; set; }
    public string? Full_Name { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public int Role { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public DateTime Creation_Date { get; set; } = DateTime.UtcNow;
    public string? IC { get; set; }
    public string? Mobile_No { get; set; }
    public string? Email { get; set; }
    public string? Staff_Code { get; set; }
}
