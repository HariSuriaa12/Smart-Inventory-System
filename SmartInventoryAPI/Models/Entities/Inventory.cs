namespace SmartInventoryAPI.Models.Entities;

public class Inventory
{
    public long ID { get; set; }
    public long ItemID { get; set; }
    public long LocationID { get; set; }
    public decimal OnHandQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign keys
    public virtual Item? Item { get; set; }
    public virtual Location? Location { get; set; }
}
