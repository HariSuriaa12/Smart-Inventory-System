namespace SmartInventoryAPI.Models.Entities;

public class Item
{
    public long ID { get; set; }
    public string? Item_Name { get; set; }
    public string? Item_Code { get; set; }
    public string? Description { get; set; }
    public string? Item_Category { get; set; }
    public string? Item_Brand { get; set; }
    public decimal Purchase_Cost { get; set; }
    public decimal Unit_Cost { get; set; }
    public bool Is_Active { get; set; } = true;
    public string? Unit_Of_Measure { get; set; }
    public string? Remark { get; set; }
    public DateTime Creation_Date { get; set; } = DateTime.UtcNow;
    public bool Is_Deleted { get; set; } = false;
    public string? Item_Image_URL { get; set; }
    public decimal Tax_Percentage { get; set; }
    public string? Tax_Type { get; set; }
    public string? Item_Type { get; set; }
}
