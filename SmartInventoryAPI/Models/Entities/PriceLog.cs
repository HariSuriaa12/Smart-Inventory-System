namespace SmartInventoryAPI.Models.Entities;

public class PriceLog
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public decimal Previous_Unit_Price { get; set; }
    public decimal New_Unit_Price { get; set; }
    public long Performed_Log_ID { get; set; }
    public bool Is_Deleted { get; set; } = false;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual PerformLog? PerformLog { get; set; }
}
