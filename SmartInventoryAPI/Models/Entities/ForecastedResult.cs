namespace SmartInventoryAPI.Models.Entities;

public class ForecastedResult
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public long Location_ID { get; set; }
    public int Forecasted_Period_In_Days { get; set; }
    public decimal Forecasted_Quantity { get; set; }
    public int Forecast_Method { get; set; }
    public string? Model_Version { get; set; }
    public DateTime Creation_Date { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual Location? Location { get; set; }
}
