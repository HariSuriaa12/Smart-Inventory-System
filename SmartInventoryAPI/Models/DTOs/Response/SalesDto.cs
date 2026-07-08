namespace SmartInventoryAPI.Models.DTOs.Response;

public class SalesDto
{
    public long ID { get; set; }
    public long LocationID { get; set; }
    public string? LocationName { get; set; }
    public int SalesStatus { get; set; }
    public DateTime SalesDate { get; set; }
    public string? SalesNumber { get; set; }
    public decimal TotalAmount { get; set; }
}

public class SalesItemDto
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public string? ItemName { get; set; }
    public decimal SoldQuantity { get; set; }
    public decimal SubTotal { get; set; }
    public bool IsPromotion { get; set; }
    public decimal DiscountPercentage { get; set; }
}

public class SalesDetailDto
{
    public long ID { get; set; }
    public long LocationID { get; set; }
    public string? LocationName { get; set; }
    public int SalesStatus { get; set; }
    public DateTime SalesDate { get; set; }
    public string? SalesNumber { get; set; }
    public List<SalesItemDto>? Items { get; set; }
}
