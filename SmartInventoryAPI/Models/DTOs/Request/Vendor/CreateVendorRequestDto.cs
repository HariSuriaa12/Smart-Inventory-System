namespace SmartInventoryAPI.Models.DTOs.Request.Vendor;

public class CreateVendorRequestDto
{
    public string? Company_Name { get; set; }
    public string? Vendor_Code { get; set; }
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}

public class UpdateVendorRequestDto
{
    public string? Company_Name { get; set; }
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
