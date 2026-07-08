namespace SmartInventoryAPI.Models.Entities;

public class ForecastedResult
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public long LocationID { get; set; }
    public int ForecastedPeriodInDays { get; set; }
    public decimal ForecastedQuantity { get; set; }
    public int ForecastMethod { get; set; }
    public string? ModelVersion { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual Location? Location { get; set; }
}
