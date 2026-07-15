namespace SmartInventoryAPI.Models.DTOs.Response;

public class SalesDto
{
    public long ID { get; set; }
    public long Location_ID { get; set; }
    public string? Location_Name { get; set; }
    public int Sales_Status { get; set; }
    public DateTime Sales_Date { get; set; }
    public TimeSpan Sales_Time { get; set; }
    public string? Sales_Number { get; set; }
    public decimal Total_Amount { get; set; }
    //public DateTime Creation_Date { get; set; }
}

public class SalesItemDto
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public string? Item_Name { get; set; }
    public string? Item_Code { get; set; }
    public string? Item_Category { get; set; }
    public string? Unit_Of_Measure { get; set; }
    public decimal Sold_Quantity { get; set; }
    public decimal Sub_Total { get; set; }
    public bool Is_Promotion { get; set; }
    public decimal Discount_Percentage { get; set; }
}

public class SalesDetailDto
{
    public long ID { get; set; }
    public long Location_ID { get; set; }
    public string? Location_Name { get; set; }
    public int Sales_Status { get; set; }
    public DateTime Sales_Date { get; set; }
    public TimeSpan Sales_Time { get; set; }
    public string? Sales_Number { get; set; }
    public List<SalesItemDto>? Items { get; set; }
}
