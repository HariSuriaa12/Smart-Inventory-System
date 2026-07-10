namespace SmartInventoryAPI.Models.Entities;

public class OrderFulfillmentItem
{
    public long ID { get; set; }
    public long Fulfillment_ID { get; set; }
    public long Item_ID { get; set; }
    public decimal Request_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
    public int Status { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public decimal Sub_Total { get; set; }
    public decimal Shipped_Quantity { get; set; }

    // Foreign keys
    public virtual OrderFulfillmentHeader? OrderFulfillment { get; set; }
    public virtual Item? Item { get; set; }
}
