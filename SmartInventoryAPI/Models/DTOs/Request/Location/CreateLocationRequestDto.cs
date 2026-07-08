namespace SmartInventoryAPI.Models.DTOs.Request.Location;

public class CreateLocationRequestDto
{
    public string? LocationName { get; set; }
    public string? OutletCode { get; set; }
    public int LocationType { get; set; }
    public string? Address { get; set; }
}

public class UpdateLocationRequestDto
{
    public string? LocationName { get; set; }
    public string? Address { get; set; }
    public int LocationType { get; set; }
}
