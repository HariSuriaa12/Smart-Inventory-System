namespace SmartInventoryAPI.Models.DTOs.Request.Location;

public class CreateLocationRequestDto
{
    public string? Location_Name { get; set; }
    public string? Outlet_Code { get; set; }
    public int Location_Type { get; set; }
    public string? Address { get; set; }
}

public class UpdateLocationRequestDto
{
    public string? Location_Name { get; set; }
    public string? Outlet_Code { get; set; }
    public string? Address { get; set; }
    public int Location_Type { get; set; }
}
