namespace SmartInventoryAPI.Models.Entities;

public class PurchaseOrderItem
{
    public long ID { get; set; }
    public long POID { get; set; }
    public long ItemID { get; set; }
    public decimal OrderQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public int Status { get; set; }
    public decimal SubTotal { get; set; }
    public bool IsDeleted { get; set; } = false;
    public decimal ReceivedQuantity { get; set; }

    // Foreign keys
    public virtual PurchaseOrderHeader? PurchaseOrder { get; set; }
    public virtual Item? Item { get; set; }
}
