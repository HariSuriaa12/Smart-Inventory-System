namespace SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;

public class ReceiveOrderFulfillmentRequestDto
{
    public long Location_ID { get; set; }
    public long Customer_ID { get; set; }
    public DateTime Order_Date { get; set; }
    public string? Shipment_Address_Line_1 { get; set; }
    public string? Shipment_Address_Line_2 { get; set; }
    public string? Shipment_City { get; set; }
    public string? Shipment_State { get; set; }
    public string? Shipment_PostCode { get; set; }
    public string? Shipment_Country_Code { get; set; }
    public string? Remark { get; set; }
    public List<OrderFulfillmentItemRequestDto>? Items { get; set; }
}

public class OrderFulfillmentItemRequestDto
{
    public long Item_ID { get; set; }
    public decimal Request_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
}

public class UpdateOrderFulfillmentRequestDto
{
    public int Status { get; set; }
    public string? Remark { get; set; }
}
