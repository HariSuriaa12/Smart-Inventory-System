namespace SmartInventoryAPI.Models.Entities;

public class Vendor
{
    public long ID { get; set; }
    public string? Company_Name { get; set; }
    public string? Vendor_Code { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime Creation_Date { get; set; } = DateTime.UtcNow;
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
