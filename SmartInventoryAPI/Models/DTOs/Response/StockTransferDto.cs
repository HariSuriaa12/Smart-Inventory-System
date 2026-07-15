namespace SmartInventoryAPI.Models.DTOs.Response;

public class StockTransferDto
{
    public long ID { get; set; }
    public long From_Location_ID { get; set; }
    public string? From_Location_Name { get; set; }
    public long To_Location_ID { get; set; }
    public string? To_Location_Name { get; set; }
    public DateTime Transfer_Date { get; set; }
    public string? Transfer_Time { get; set; }
    public long Item_ID { get; set; }
    public string? Item_Name { get; set; }
    public string? Item_Code { get; set; }
    public decimal Transfer_Quantity { get; set; }
    public decimal Received_Quantity { get; set; }
    public string? Remark { get; set; }
    public int Status { get; set; }
    public decimal Sub_Total { get; set; }
    public long Performed_By { get; set; }
    public string? User_Full_Name { get; set; }
    public string? User_Staff_Code { get; set; }
    public DateTime Creation_Date { get; set; }
}
