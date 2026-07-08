namespace SmartInventoryAPI.Models.DTOs.Request.Customer;

public class CreateCustomerRequestDto
{
    public string? CompanyName { get; set; }
    public string? CustomerCode { get; set; }
    public string? Address { get; set; }
    public string? CompanyAddress { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}

public class UpdateCustomerRequestDto
{
    public string? CompanyName { get; set; }
    public string? Address { get; set; }
    public string? CompanyAddress { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
