namespace SmartInventoryAPI.Models.DTOs.Response;

public class PurchaseOrderDto
{
    public long ID { get; set; }
    public string? PORefenceNo { get; set; }
    public long LocationID { get; set; }
    public DateTime PurchaseDate { get; set; }
    public long VendorID { get; set; }
    public string? VendorName { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreationDate { get; set; }
}

public class PurchaseOrderItemDto
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public string? ItemName { get; set; }
    public decimal OrderQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public int Status { get; set; }
    public decimal SubTotal { get; set; }
    public decimal ReceivedQuantity { get; set; }
}

public class PurchaseOrderDetailDto
{
    public long ID { get; set; }
    public string? PORefenceNo { get; set; }
    public long LocationID { get; set; }
    public DateTime PurchaseDate { get; set; }
    public long VendorID { get; set; }
    public string? VendorName { get; set; }
    public int Status { get; set; }
    public string? Remark { get; set; }
    public decimal TotalAmount { get; set; }
    public List<PurchaseOrderItemDto>? Items { get; set; }
}
