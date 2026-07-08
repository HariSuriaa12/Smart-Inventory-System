namespace SmartInventoryAPI.Models.DTOs.Response;

public class OrderFulfillmentDto
{
    public long ID { get; set; }
    public long LocationID { get; set; }
    public DateTime OrderDate { get; set; }
    public long CustomerID { get; set; }
    public string? CustomerName { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public decimal TotalAmount { get; set; }
}

public class OrderFulfillmentItemDto
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public string? ItemName { get; set; }
    public decimal RequestQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public int Status { get; set; }
    public decimal SubTotal { get; set; }
    public decimal ShippedQuantity { get; set; }
}

public class OrderFulfillmentDetailDto
{
    public long ID { get; set; }
    public long LocationID { get; set; }
    public DateTime OrderDate { get; set; }
    public long CustomerID { get; set; }
    public string? CustomerName { get; set; }
    public string? ShipmentCity { get; set; }
    public string? ShipmentState { get; set; }
    public int Status { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderFulfillmentItemDto>? Items { get; set; }
}
