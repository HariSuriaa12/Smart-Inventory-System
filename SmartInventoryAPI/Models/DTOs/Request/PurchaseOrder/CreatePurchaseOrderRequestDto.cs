namespace SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;

public class CreatePurchaseOrderRequestDto
{
    public long LocationID { get; set; }
    public long VendorID { get; set; }
    public string? Remark { get; set; }
    public List<PurchaseOrderItemRequestDto>? Items { get; set; }
}

public class PurchaseOrderItemRequestDto
{
    public long ItemID { get; set; }
    public decimal OrderQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdatePurchaseOrderRequestDto
{
    public string? Remark { get; set; }
    public int Status { get; set; }
}
