namespace SmartInventoryAPI.Models.Entities;

public class Location
{
    public long ID { get; set; }
    public string? Location_Name { get; set; }
    public string? Outlet_Code { get; set; }
    public int Location_Type { get; set; }
    public string? Address { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public DateTime Creation_Date { get; set; } = DateTime.UtcNow;
}
