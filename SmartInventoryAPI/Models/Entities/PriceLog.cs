namespace SmartInventoryAPI.Models.Entities;

public class PriceLog
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public decimal PreviousUnitPrice { get; set; }
    public decimal NewUnitPrice { get; set; }
    public long PerformedLogID { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual PerformLog? PerformLog { get; set; }
}
