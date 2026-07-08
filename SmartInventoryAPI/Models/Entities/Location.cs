namespace SmartInventoryAPI.Models.Entities;

public class Location
{
    public long ID { get; set; }
    public string? LocationName { get; set; }
    public string? OutletCode { get; set; }
    public int LocationType { get; set; }
    public string? Address { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
}
