namespace SmartInventoryAPI.Models.Entities;

public class InventoryLog
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public long Location_ID { get; set; }
    public decimal Previous_Onhand_Quantity { get; set; }
    public decimal New_Onhand_Quantity { get; set; }
    public decimal Previous_Available_Quantity { get; set; }
    public decimal New_Available_Quantity { get; set; }
    public long Performed_Log_ID { get; set; }
    public bool Is_Deleted { get; set; } = false;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual Location? Location { get; set; }
    public virtual PerformLog? PerformLog { get; set; }
}
