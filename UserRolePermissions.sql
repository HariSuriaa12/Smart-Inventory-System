-- Create Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,  -- Auto-increment integer
    role_id INT NOT NULL UNIQUE,
    role_name VARCHAR(50),

    -- View Permissions
    view_items BOOLEAN DEFAULT FALSE,
    view_locations BOOLEAN DEFAULT FALSE,
    view_vendors BOOLEAN DEFAULT FALSE,
    view_customers BOOLEAN DEFAULT FALSE,
    view_users BOOLEAN DEFAULT FALSE,
    view_inventory BOOLEAN DEFAULT FALSE,
    view_purchase_orders BOOLEAN DEFAULT FALSE,
    view_order_fulfillment BOOLEAN DEFAULT FALSE,
    view_stock_transfer BOOLEAN DEFAULT FALSE,
    view_sales BOOLEAN DEFAULT FALSE,

    -- General Permissions (for all modules)
    create_data BOOLEAN DEFAULT FALSE,
    update_data BOOLEAN DEFAULT FALSE,
    delete_data BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_is_active ON role_permissions(is_active);

-- Insert default permissions for Admin role (role_id = 0)
INSERT INTO role_permissions (
    role_id,
    role_name,
    view_items,
    view_locations,
    view_vendors,
    view_customers,
    view_users,
    view_inventory,
    view_purchase_orders,
    view_order_fulfillment,
    view_stock_transfer,
    view_sales,
    create_data,
    update_data,
    delete_data,
    is_active
) VALUES (
    0,
    'Admin',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (role_id) DO NOTHING;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON role_permissions
FOR EACH ROW
EXECUTE FUNCTION update_role_permissions_updated_at();
