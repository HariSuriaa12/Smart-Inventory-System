namespace SmartInventoryAPI.Models.Entities;

public class Sales
{
    public long ID { get; set; }
    public long Location_ID { get; set; }
    public int Sales_Status { get; set; }
    public DateTime Sales_Date { get; set; }
    public TimeSpan Sales_Time { get; set; }
    public bool Is_Deleted { get; set; } = false;
    public bool Is_Reserved { get; set; }
    public string? Sales_Number { get; set; }
    public long? Ref_Sales_Number { get; set; }
    public decimal Total_Amount { get; set; }
    //public DateTime Creation_Date { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public virtual Location? Location { get; set; }
    public virtual Sales? RefSales { get; set; }
    public virtual ICollection<SalesItem>? Items { get; set; }
}
