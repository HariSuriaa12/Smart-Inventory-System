namespace SmartInventoryAPI.Models.DTOs.Response;

public class CustomerDto
{
    public long ID { get; set; }
    public string? Company_Name { get; set; }
    public string? Customer_Code { get; set; }
    public string? Address { get; set; }
    public DateTime Creation_Date { get; set; }
    public string? Company_Address { get; set; }
    public string? Email { get; set; }
    public string? Mobile { get; set; }
}
