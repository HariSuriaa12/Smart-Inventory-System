namespace SmartInventoryAPI.Models.DTOs.Request.StockTransfer;

public class ReceiveStockRequestDto
{
    public decimal ReceivedQuantity { get; set; }
    public string? Remark { get; set; }
}
