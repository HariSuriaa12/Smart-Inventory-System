namespace SmartInventoryAPI.Models.DTOs.Request.Item;

public class CreateItemRequestDto
{
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? Description { get; set; }
    public string? ItemCategory { get; set; }
    public string? ItemBrand { get; set; }
    public decimal PurchaseCost { get; set; }
    public decimal UnitCost { get; set; }
    public string? UnitOfMeasure { get; set; }
    public string? Remark { get; set; }
    public string? ItemImageURL { get; set; }
    public decimal TaxPercentage { get; set; }
    public string? TaxType { get; set; }
    public string? ItemType { get; set; }
}

public class UpdateItemRequestDto
{
    public string? ItemName { get; set; }
    public string? Description { get; set; }
    public string? ItemCategory { get; set; }
    public string? ItemBrand { get; set; }
    public decimal PurchaseCost { get; set; }
    public decimal UnitCost { get; set; }
    public string? UnitOfMeasure { get; set; }
    public string? Remark { get; set; }
    public string? ItemImageURL { get; set; }
    public decimal TaxPercentage { get; set; }
    public bool IsActive { get; set; }
}
