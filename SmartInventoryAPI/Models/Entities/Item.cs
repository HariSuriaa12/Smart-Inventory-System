namespace SmartInventoryAPI.Models.Entities;

public class Item
{
    public long ID { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? Description { get; set; }
    public string? ItemCategory { get; set; }
    public string? ItemBrand { get; set; }
    public decimal PurchaseCost { get; set; }
    public decimal UnitCost { get; set; }
    public bool IsActive { get; set; } = true;
    public string? UnitOfMeasure { get; set; }
    public string? Remark { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public string? ItemImageURL { get; set; }
    public decimal TaxPercentage { get; set; }
    public string? TaxType { get; set; }
    public string? ItemType { get; set; }
}
