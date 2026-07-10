namespace SmartInventoryAPI.Models.DTOs.Request.Sales;

public class ReceiveSalesRequestDto
{
    public long Location_ID { get; set; }
    public DateTime Sales_Date { get; set; }
    public string? Sales_Number { get; set; }
    public int Sales_Status { get; set; }
    public List<SalesItemRequestDto>? Items { get; set; }
}

public class SalesItemRequestDto
{
    public long Item_ID { get; set; }
    public decimal Sold_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
    public bool Is_Promotion { get; set; }
    public decimal Discount_Percentage { get; set; }
}
