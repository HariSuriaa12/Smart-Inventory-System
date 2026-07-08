namespace SmartInventoryAPI.Models.Entities;

public class PerformLog
{
    public long ID { get; set; }
    public long PerformedBy { get; set; }
    public long PerformedOutlet { get; set; }
    public int PerformModule { get; set; }
    public int OperationType { get; set; }
    public string? PerformRemark { get; set; }
    public DateTime PerformDate { get; set; } = DateTime.UtcNow;
    public long OperationID { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign keys
    public virtual User? User { get; set; }
    public virtual Location? Location { get; set; }
}
