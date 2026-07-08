namespace SmartInventoryAPI.Models.Entities;

public class StockTransfer
{
    public long ID { get; set; }
    public long FromLocationID { get; set; }
    public long ToLocationID { get; set; }
    public DateTime TransferDate { get; set; }
    public TimeSpan TransferTime { get; set; }
    public long ItemID { get; set; }
    public decimal TransferQuantity { get; set; }
    public string? Remark { get; set; }
    public int Status { get; set; }
    public decimal SubTotal { get; set; }
    public bool IsDeleted { get; set; } = false;
    public long PerformedBy { get; set; }

    // Foreign keys
    public virtual Location? FromLocation { get; set; }
    public virtual Location? ToLocation { get; set; }
    public virtual Item? Item { get; set; }
    public virtual User? User { get; set; }
}
