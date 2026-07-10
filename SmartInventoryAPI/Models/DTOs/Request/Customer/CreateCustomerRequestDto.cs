namespace SmartInventoryAPI.Models.DTOs.Request.Customer;

public class CreateCustomerRequestDto
{
    public string? Company_Name { get; set; }
    public string? Customer_Code { get; set; }
    public string? Address { get; set; }
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}

public class UpdateCustomerRequestDto
{
    public string? Company_Name { get; set; }
    public string? Address { get; set; }
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
