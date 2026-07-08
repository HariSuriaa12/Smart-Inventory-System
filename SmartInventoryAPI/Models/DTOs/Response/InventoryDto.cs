namespace SmartInventoryAPI.Models.DTOs.Response;

public class InventoryDto
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public long LocationID { get; set; }
    public string? ItemName { get; set; }
    public string? LocationName { get; set; }
    public decimal OnHandQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
}
