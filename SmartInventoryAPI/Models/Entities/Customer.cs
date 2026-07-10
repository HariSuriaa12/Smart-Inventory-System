namespace SmartInventoryAPI.Models.Entities;

public class Customer
{
    public long ID { get; set; }
    public string? Company_Name { get; set; }
    public string? Customer_Code { get; set; }
    public string? Address { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime Creation_Date { get; set; } = DateTime.UtcNow;
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
