namespace SmartInventoryAPI.Models.Entities;

public class PurchaseOrderItem
{
    public long ID { get; set; }
    public long PO_ID { get; set; }
    public long Item_ID { get; set; }
    public decimal Order_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
    public int Status { get; set; }
    public decimal Sub_Total { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public decimal Received_Quantity { get; set; }

    // Foreign keys
    public virtual PurchaseOrderHeader? PurchaseOrder { get; set; }
    public virtual Item? Item { get; set; }
}
