namespace SmartInventoryAPI.Models.Entities;

public class OrderFulfillmentHeader
{
    public long ID { get; set; }
    public long? Location_ID { get; set; }
    public DateTime Order_Date { get; set; }
    public TimeSpan Order_Time { get; set; }
    public string? Shipment_Address_Line_1 { get; set; }
    public string? Shipment_Address_Line_2 { get; set; }
    public string? Shipment_City { get; set; }
    public string? Shipment_State { get; set; }
    public string? Shipment_PostCode { get; set; }
    public string? Shipment_Country_Code { get; set; }
    public string? Remark { get; set; }
    public int Status { get; set; }
    public long? Verified_By { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public decimal Total_Amount { get; set; }
    public long? Customer_ID { get; set; }

    // Foreign keys
    public virtual Location? Location { get; set; }
    public virtual User? User { get; set; }
    public virtual Customer? Customer { get; set; }
    public virtual ICollection<OrderFulfillmentItem>? Items { get; set; }
}
