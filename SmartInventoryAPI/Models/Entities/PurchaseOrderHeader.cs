namespace SmartInventoryAPI.Models.Entities;

public class PurchaseOrderHeader
{
    public long ID { get; set; }
    public string? PO_Refence_No { get; set; }
    public long Location_ID { get; set; }
    public DateTime Purchase_Date { get; set; }
    public TimeSpan Purchase_Time { get; set; }
    public long Vendor_ID { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public long Performed_By { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public decimal Total_Amount { get; set; }

    // Foreign keys
    public virtual Vendor? Vendor { get; set; }
    public virtual Location? Location { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<PurchaseOrderItem>? Items { get; set; }
}
