namespace SmartInventoryAPI.Models.Entities;

public class PerformLog
{
    public long ID { get; set; }
    public long Performed_By { get; set; }
    public long Performed_Outlet { get; set; }
    public int Perform_Module { get; set; }
    public int Operation_Type { get; set; }
    public string? Perform_Remark { get; set; }
    public DateTime Perform_Date { get; set; } = DateTime.UtcNow;
    public long Operation_ID { get; set; }
    public bool Is_Deleted { get; set; } = false;

    // Foreign keys
    public virtual User? User { get; set; }
    public virtual Location? Location { get; set; }
}
