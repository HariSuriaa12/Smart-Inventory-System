namespace SmartInventoryAPI.Models.Entities;

public class PurchaseOrderHeader
{
    public long ID { get; set; }
    public string? PORefenceNo { get; set; }
    public long LocationID { get; set; }
    public DateTime PurchaseDate { get; set; }
    public TimeSpan PurchaseTime { get; set; }
    public long VendorID { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public long PerformedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public decimal TotalAmount { get; set; }

    // Foreign keys
    public virtual Vendor? Vendor { get; set; }
    public virtual Location? Location { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<PurchaseOrderItem>? Items { get; set; }
}
