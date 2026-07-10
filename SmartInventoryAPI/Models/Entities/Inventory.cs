namespace SmartInventoryAPI.Models.Entities;

public class Inventory
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public long Location_ID { get; set; }
    public decimal On_Hand_Quantity { get; set; }
    public decimal Available_Quantity { get; set; }
    public bool Is_Deleted { get; set; } = false;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual Location? Location { get; set; }
}
