namespace SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;

public class AddPurchaseOrderItemRequestDto
{
    public long Item_ID { get; set; }
    public decimal Order_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
}
