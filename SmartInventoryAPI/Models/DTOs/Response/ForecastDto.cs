namespace SmartInventoryAPI.Models.DTOs.Response;

public class ForecastDto
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public string? ItemName { get; set; }
    public long LocationID { get; set; }
    public string? LocationName { get; set; }
    public int ForecastedPeriodInDays { get; set; }
    public decimal ForecastedQuantity { get; set; }
    public int ForecastMethod { get; set; }
    public string? ModelVersion { get; set; }
    public DateTime CreationDate { get; set; }
}
