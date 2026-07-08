namespace SmartInventoryAPI.Models.Entities;

public class InventoryLog
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public long LocationID { get; set; }
    public decimal PreviousOnhandQuantity { get; set; }
    public decimal NewOnhandQuantity { get; set; }
    public decimal PreviousAvailableQuantity { get; set; }
    public decimal NewAvailableQuantity { get; set; }
    public long PerformedLogID { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual Location? Location { get; set; }
    public virtual PerformLog? PerformLog { get; set; }
}
