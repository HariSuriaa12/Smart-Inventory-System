namespace SmartInventoryAPI.Models.Entities;

public class Customer
{
    public long ID { get; set; }
    public string? CompanyName { get; set; }
    public string? CustomerCode { get; set; }
    public string? Address { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    public string? CompanyAddress { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
