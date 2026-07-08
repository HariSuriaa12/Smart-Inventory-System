namespace SmartInventoryAPI.Models.Entities;

public class Sales
{
    public long ID { get; set; }
    public long LocationID { get; set; }
    public int SalesStatus { get; set; }
    public DateTime SalesDate { get; set; }
    public TimeSpan SalesTime { get; set; }
    public bool IsDeleted { get; set; } = false;
    public bool IsReserved { get; set; }
    public string? SalesNumber { get; set; }
    public long? RefSalesNumber { get; set; }

    // Foreign keys
    public virtual Location? Location { get; set; }
    public virtual Sales? RefSales { get; set; }
    public virtual ICollection<SalesItem>? Items { get; set; }
}
