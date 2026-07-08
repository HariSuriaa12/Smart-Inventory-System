namespace SmartInventoryAPI.Models.DTOs.Response;

public class LocationDto
{
    public long ID { get; set; }
    public string? LocationName { get; set; }
    public string? OutletCode { get; set; }
    public int LocationType { get; set; }
    public string? Address { get; set; }
    public DateTime CreationDate { get; set; }
}
