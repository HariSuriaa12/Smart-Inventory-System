namespace SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;

public class CreatePurchaseOrderRequestDto
{
    public long Location_ID { get; set; }
    public long Vendor_ID { get; set; }
    public string? Remark { get; set; }
    public string? PO_Reference_No { get; set; }
    public List<PurchaseOrderItemRequestDto>? Items { get; set; }
}

public class PurchaseOrderItemRequestDto
{
    public long Item_ID { get; set; }
    public decimal Order_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
}

public class UpdatePurchaseOrderRequestDto
{
    public string? Remark { get; set; }
    public int Status { get; set; }
}
