namespace SmartInventoryAPI.Models.DTOs.Response;

public class OrderFulfillmentDto
{
    public long ID { get; set; }
    public long Location_ID { get; set; }
    public string? Location_Name { get; set; }
    public DateTime Order_Date { get; set; }
    public long Customer_ID { get; set; }
    public string? Customer_Name { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public decimal Total_Amount { get; set; }
    public long Verified_By { get; set; }
    public string? Verified_By_Name { get; set; }
}

public class OrderFulfillmentItemDto
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public string? Item_Code { get; set; }
    public string? Item_Name { get; set; }
    public string? Item_Category { get; set; }
    public string? Unit_Of_Measure { get; set; }
    public decimal Request_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
    public int Status { get; set; }
    public decimal Sub_Total { get; set; }
    public decimal Shipped_Quantity { get; set; }
}

public class OrderFulfillmentDetailDto
{
    public long ID { get; set; }
    public long Location_ID { get; set; }
    public string? Location_Name { get; set; }
    public DateTime Order_Date { get; set; }
    public long Customer_ID { get; set; }
    public string? Customer_Name { get; set; }
    public string? Shipment_Address_Line_1 { get; set; }
    public string? Shipment_Address_Line_2 { get; set; }
    public string? Shipment_City { get; set; }
    public string? Shipment_State { get; set; }
    public string? Shipment_PostCode { get; set; }
    public string? Shipment_Country_Code { get; set; }
    public int Status { get; set; }
    public decimal Total_Amount { get; set; }
    public long Verified_By { get; set; }
    public string? Verified_By_Name { get; set; }
    public string? Remark { get; set; }
    public List<OrderFulfillmentItemDto>? Items { get; set; }
}
