namespace SmartInventoryAPI.Models.Entities;

public class SalesItem
{
    public long ID { get; set; }
    public long Sales_ID { get; set; }
    public long Item_ID { get; set; }
    public decimal Sold_Quantity { get; set; }
    public decimal Sub_Total { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public bool Is_Promotion { get; set; }
    public decimal Discount_Percentage { get; set; }

    // Foreign keys
    public virtual Sales? Sales { get; set; }
    public virtual Item? Item { get; set; }
}
