namespace SmartInventoryAPI.Models.Entities;

public class StockTransfer
{
    public long ID { get; set; }
    public long From_Location_ID { get; set; }
    public long To_Location_ID { get; set; }
    public DateTime Transfer_Date { get; set; }
    public TimeSpan Transfer_Time { get; set; }
    public long Item_ID { get; set; }
    public decimal Transfer_Quantity { get; set; }
    public decimal Received_Quantity { get; set; } = 0;
    public string? Remark { get; set; }
    public int Status { get; set; }
    public decimal Sub_Total { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public long Performed_By { get; set; }

    // Foreign keys
    public virtual Location? FromLocation { get; set; }
    public virtual Location? ToLocation { get; set; }
    public virtual Item? Item { get; set; }
    public virtual User? User { get; set; }
}
