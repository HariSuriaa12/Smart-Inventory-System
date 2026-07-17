namespace SmartInventoryAPI.Models.Entities;

public class RolePermission
{
    public int id { get; set; }
    public int role_id { get; set; }
    public string? role_name { get; set; }

    // View Permissions
    public bool view_items { get; set; } = false;
    public bool view_locations { get; set; } = false;
    public bool view_vendors { get; set; } = false;
    public bool view_customers { get; set; } = false;
    public bool view_users { get; set; } = false;
    public bool view_inventory { get; set; } = false;
    public bool view_purchase_orders { get; set; } = false;
    public bool view_order_fulfillment { get; set; } = false;
    public bool view_stock_transfer { get; set; } = false;
    public bool view_sales { get; set; } = false;

    // General Permissions
    public bool create_data { get; set; } = false;
    public bool update_data { get; set; } = false;
    public bool delete_data { get; set; } = false;

    // Metadata
    public DateTime created_at { get; set; } = DateTime.UtcNow;
    public DateTime updated_at { get; set; } = DateTime.UtcNow;
    public bool is_active { get; set; } = true;
}
