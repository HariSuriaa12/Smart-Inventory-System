namespace SmartInventoryAPI.Models.DTOs.Response;

public class LocationDto
{
    public long ID { get; set; }
    public string? Location_Name { get; set; }
    public string? Outlet_Code { get; set; }
    public int Location_Type { get; set; }
    public string? Address { get; set; }
    public DateTime Creation_Date { get; set; }
}
