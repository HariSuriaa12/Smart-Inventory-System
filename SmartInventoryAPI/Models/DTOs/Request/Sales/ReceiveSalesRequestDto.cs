namespace SmartInventoryAPI.Models.DTOs.Request.Sales;

public class ReceiveSalesRequestDto
{
    public long LocationID { get; set; }
    public DateTime SalesDate { get; set; }
    public string? SalesNumber { get; set; }
    public int SalesStatus { get; set; }
    public List<SalesItemRequestDto>? Items { get; set; }
}

public class SalesItemRequestDto
{
    public long ItemID { get; set; }
    public decimal SoldQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public bool IsPromotion { get; set; }
    public decimal DiscountPercentage { get; set; }
}
