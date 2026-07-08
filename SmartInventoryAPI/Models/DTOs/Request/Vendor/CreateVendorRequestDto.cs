namespace SmartInventoryAPI.Models.DTOs.Request.Vendor;

public class CreateVendorRequestDto
{
    public string? CompanyName { get; set; }
    public string? VendorCode { get; set; }
    public string? CompanyAddress { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}

public class UpdateVendorRequestDto
{
    public string? CompanyName { get; set; }
    public string? CompanyAddress { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
