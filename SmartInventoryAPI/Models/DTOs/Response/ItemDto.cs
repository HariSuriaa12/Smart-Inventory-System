namespace SmartInventoryAPI.Models.DTOs.Response;

public class ItemDto
{
    public long ID { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? Description { get; set; }
    public string? ItemCategory { get; set; }
    public string? ItemBrand { get; set; }
    public decimal PurchaseCost { get; set; }
    public decimal UnitCost { get; set; }
    public bool IsActive { get; set; }
    public string? UnitOfMeasure { get; set; }
    public string? Remark { get; set; }
    public DateTime CreationDate { get; set; }
    public string? ItemImageURL { get; set; }
    public decimal TaxPercentage { get; set; }
    public string? TaxType { get; set; }
    public string? ItemType { get; set; }
}
