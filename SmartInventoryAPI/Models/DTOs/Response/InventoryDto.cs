namespace SmartInventoryAPI.Models.DTOs.Response;

public class InventoryDto
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public long Location_ID { get; set; }
    public string? Item_Name { get; set; }
    public string? Location_Name { get; set; }
    public decimal OnHand_Quantity { get; set; }
    public decimal Available_Quantity { get; set; }
}
