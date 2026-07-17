namespace SmartInventoryAPI.Models.DTOs.Request.RolePermission;

public class CreateRolePermissionRequestDto
{
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
}

public class UpdateRolePermissionRequestDto
{
    public string? Role_Name { get; set; }

    // View Permissions
    public bool View_Items { get; set; }
    public bool View_Locations { get; set; }
    public bool View_Vendors { get; set; }
    public bool View_Customers { get; set; }
    public bool View_Users { get; set; }
    public bool View_Inventory { get; set; }
    public bool View_Purchase_Orders { get; set; }
    public bool View_Order_Fulfillment { get; set; }
    public bool View_Stock_Transfer { get; set; }
    public bool View_Sales { get; set; }

    // General Permissions
    public bool Create_Data { get; set; }
    public bool Update_Data { get; set; }
    public bool Delete_Data { get; set; }

    public bool Is_Active { get; set; }
}
