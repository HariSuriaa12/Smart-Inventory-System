namespace SmartInventoryAPI.Models.Entities;

public class SalesItem
{
    public long ID { get; set; }
    public long SalesID { get; set; }
    public long ItemID { get; set; }
    public decimal SoldQuantity { get; set; }
    public decimal SubTotal { get; set; }
    public bool IsDeleted { get; set; } = false;
    public bool IsPromotion { get; set; }
    public decimal DiscountPercentage { get; set; }

    // Foreign keys
    public virtual Sales? Sales { get; set; }
    public virtual Item? Item { get; set; }
}
