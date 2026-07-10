namespace SmartInventoryAPI.Models.DTOs.Response;

public class PurchaseOrderDto
{
    public long ID { get; set; }
    public string? PO_Refence_No { get; set; }
    public long Location_ID { get; set; }
    public DateTime Purchase_Date { get; set; }
    public long Vendor_ID { get; set; }
    public string? Vendor_Name { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public decimal Total_Amount { get; set; }
    public DateTime Creation_Date { get; set; }
}

public class PurchaseOrderItemDto
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public string? Item_Name { get; set; }
    public decimal Order_Quantity { get; set; }
    public decimal Unit_Price { get; set; }
    public int Status { get; set; }
    public decimal Sub_Total { get; set; }
    public decimal Received_Quantity { get; set; }
}

public class PurchaseOrderDetailDto
{
    public long ID { get; set; }
    public string? PO_Refence_No { get; set; }
    public long Location_ID { get; set; }
    public DateTime Purchase_Date { get; set; }
    public long Vendor_ID { get; set; }
    public string? Vendor_Name { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public decimal Total_Amount { get; set; }
    public List<PurchaseOrderItemDto>? Items { get; set; }
}
