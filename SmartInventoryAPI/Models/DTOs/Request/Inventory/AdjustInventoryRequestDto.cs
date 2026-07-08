namespace SmartInventoryAPI.Models.DTOs.Request.Inventory;

public class AdjustInventoryRequestDto
{
    public long ItemID { get; set; }
    public long LocationID { get; set; }
    public decimal QuantityAdjustment { get; set; }
    public string? Remark { get; set; }
}

public class StockTransferRequestDto
{
    public long FromLocationID { get; set; }
    public long ToLocationID { get; set; }
    public long ItemID { get; set; }
    public decimal TransferQuantity { get; set; }
    public string? Remark { get; set; }
}
