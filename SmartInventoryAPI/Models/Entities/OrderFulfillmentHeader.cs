namespace SmartInventoryAPI.Models.Entities;

public class OrderFulfillmentHeader
{
    public long ID { get; set; }
    public long LocationID { get; set; }
    public DateTime OrderDate { get; set; }
    public TimeSpan OrderTime { get; set; }
    public string? ShipmentAddressLine1 { get; set; }
    public string? ShipmentAddressLine2 { get; set; }
    public string? ShipmentCity { get; set; }
    public string? ShipmentState { get; set; }
    public string? ShipmentPostCode { get; set; }
    public string? ShipmentCountryCode { get; set; }
    public string? Remark { get; set; }
    public int Status { get; set; }
    public long VerifiedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public decimal TotalAmount { get; set; }
    public long CustomerID { get; set; }

    // Foreign keys
    public virtual Location? Location { get; set; }
    public virtual User? User { get; set; }
    public virtual Customer? Customer { get; set; }
    public virtual ICollection<OrderFulfillmentItem>? Items { get; set; }
}
