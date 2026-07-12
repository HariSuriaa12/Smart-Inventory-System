namespace SmartInventoryAPI.Models.DTOs.Response;

public class InventoryDto
{
    public long ID { get; set; }
    public long Item_ID { get; set; }
    public long Location_ID { get; set; }
    public string? Location_Name { get; set; }
    public decimal OnHand_Quantity { get; set; }
    public decimal Available_Quantity { get; set; }
    public string? Item_Name { get; set; }
    public string? Item_Code { get; set; }
    public string? Description { get; set; }
    public string? Item_Category { get; set; }
    public string? Item_Brand { get; set; }
    public decimal Purchase_Cost { get; set; }
    public decimal Unit_Cost { get; set; }
    public bool Is_Active { get; set; }
    public string? Unit_Of_Measure { get; set; }
    public string? Remark { get; set; }
    public DateTime Creation_Date { get; set; }
    public string? Item_Image_URL { get; set; }
    public decimal Tax_Percentage { get; set; }
    public string? Tax_Type { get; set; }
    public string? Item_Type { get; set; }
}
