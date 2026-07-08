namespace SmartInventoryAPI.Models.DTOs.Response;

public class VendorDto
{
    public long ID { get; set; }
    public string? CompanyName { get; set; }
    public string? VendorCode { get; set; }
    public DateTime CreationDate { get; set; }
    public string? CompanyAddress { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
