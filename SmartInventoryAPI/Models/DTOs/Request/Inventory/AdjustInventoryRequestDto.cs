namespace SmartInventoryAPI.Models.DTOs.Request.Inventory;

public class AdjustInventoryRequestDto
{
    public long Item_ID { get; set; }
    public long Location_ID { get; set; }
    public decimal QuantityAdjustment { get; set; }
    public string? Remark { get; set; }
}

public class StockTransferRequestDto
{
    public long User_ID { get; set; }
    public long From_Location_ID { get; set; }
    public long To_Location_ID { get; set; }
    public long Item_ID { get; set; }
    public decimal Transfer_Quantity { get; set; }
    public string? Remark { get; set; }
}
