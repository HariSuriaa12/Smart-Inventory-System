namespace SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;

public class ReceiveOrderFulfillmentRequestDto
{
    public long LocationID { get; set; }
    public long CustomerID { get; set; }
    public DateTime OrderDate { get; set; }
    public string? ShipmentAddressLine1 { get; set; }
    public string? ShipmentAddressLine2 { get; set; }
    public string? ShipmentCity { get; set; }
    public string? ShipmentState { get; set; }
    public string? ShipmentPostCode { get; set; }
    public string? ShipmentCountryCode { get; set; }
    public string? Remark { get; set; }
    public List<OrderFulfillmentItemRequestDto>? Items { get; set; }
}

public class OrderFulfillmentItemRequestDto
{
    public long ItemID { get; set; }
    public decimal RequestQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdateOrderFulfillmentRequestDto
{
    public int Status { get; set; }
    public string? Remark { get; set; }
}
