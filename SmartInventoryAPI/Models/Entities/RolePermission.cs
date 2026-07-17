namespace SmartInventoryAPI.Models.Entities;

public class RolePermission
{
    public int ID { get; set; }
    public int Role_ID { get; set; }
    public string? Role_Name { get; set; }

    // View Permissions
    public bool View_Items { get; set; } = false;
    public bool View_Locations { get; set; } = false;
    public bool View_Vendors { get; set; } = false;
    public bool View_Customers { get; set; } = false;
    public bool View_Users { get; set; } = false;
    public bool View_Inventory { get; set; } = false;
    public bool View_Purchase_Orders { get; set; } = false;
    public bool View_Order_Fulfillment { get; set; } = false;
    public bool View_Stock_Transfer { get; set; } = false;
    public bool View_Sales { get; set; } = false;

    // General Permissions
    public bool Create_Data { get; set; } = false;
    public bool Update_Data { get; set; } = false;
    public bool Delete_Data { get; set; } = false;

    // Metadata
    public DateTime Created_At { get; set; } = DateTime.UtcNow;
    public DateTime Updated_At { get; set; } = DateTime.UtcNow;
    public bool Is_Active { get; set; } = true;
}
