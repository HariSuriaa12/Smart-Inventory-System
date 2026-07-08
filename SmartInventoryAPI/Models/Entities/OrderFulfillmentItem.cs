namespace SmartInventoryAPI.Models.Entities;

public class OrderFulfillmentItem
{
    public long ID { get; set; }
    public long FulfillmentID { get; set; }
    public long ItemID { get; set; }
    public decimal RequestQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public int Status { get; set; }
    public bool IsDeleted { get; set; } = false;
    public decimal SubTotal { get; set; }
    public decimal ShippedQuantity { get; set; }

    // Foreign keys
    public virtual OrderFulfillmentHeader? OrderFulfillment { get; set; }
    public virtual Item? Item { get; set; }
}
