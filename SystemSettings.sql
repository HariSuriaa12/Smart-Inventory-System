-- Create System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_type VARCHAR(50) NOT NULL,  -- e.g., 'role', 'email', 'notification', 'system'
    setting_key VARCHAR(100) NOT NULL,  -- e.g., 'admin_role', 'smtp_host'
    setting_value TEXT,                  -- e.g., '0', 'smtp.gmail.com'
    setting_name VARCHAR(255),            -- Human-readable name e.g., 'Administrator Role'
    description TEXT,                     -- Documentation/description of the setting
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint on setting_type and setting_key combination
    CONSTRAINT uk_setting_type_key UNIQUE(setting_type, setting_key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_type ON system_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_system_settings_type_key ON system_settings(setting_type, setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_active ON system_settings(is_active);

-- Insert Admin role setting
INSERT INTO system_settings (
    setting_type,
    setting_key,
    setting_value,
    setting_name,
    description,
    is_active
) VALUES (
    'role',
    'admin_role',
    '0',
    'Administrator',
    'Super admin role with full access to all modules',
    TRUE
) ON CONFLICT (setting_type, setting_key) DO NOTHING;

-- Example: Insert other role settings (uncomment to use)
/*
INSERT INTO system_settings (
    setting_type,
    setting_key,
    setting_value,
    setting_name,
    description,
    is_active
) VALUES
(
    'role',
    'manager_role',
    '1',
    'Manager',
    'Manager role with limited administrative capabilities',
    TRUE
),
(
    'role',
    'viewer_role',
    '2',
    'Viewer',
    'Viewer role with read-only access',
    TRUE
),
(
    'role',
    'operator_role',
    '3',
    'Operator',
    'Operator role with data entry and modification capabilities',
    TRUE
);
*/

-- Example: Insert other system settings (uncomment to use)
/*
INSERT INTO system_settings (
    setting_type,
    setting_key,
    setting_value,
    setting_name,
    description,
    is_active
) VALUES
(
    'system',
    'company_name',
    'Smart Inventory Inc.',
    'Company Name',
    'Name of the organization',
    TRUE
),
(
    'system',
    'app_version',
    '1.0.0',
    'Application Version',
    'Current version of the application',
    TRUE
),
(
    'email',
    'smtp_host',
    'smtp.gmail.com',
    'SMTP Host',
    'Email server hostname',
    TRUE
),
(
    'email',
    'smtp_port',
    '587',
    'SMTP Port',
    'Email server port',
    TRUE
),
(
    'notification',
    'enable_email_notifications',
    'true',
    'Enable Email Notifications',
    'Enable or disable email notifications system-wide',
    TRUE
);
*/

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_system_settings_updated_at();

-- View to get all active role settings
CREATE OR REPLACE VIEW active_roles AS
SELECT
    id,
    setting_key,
    setting_value::INT AS role_id,
    setting_name,
    description,
    created_at
FROM system_settings
WHERE setting_type = 'role' AND is_active = TRUE
ORDER BY setting_value::INT;

-- View to get all active system settings grouped by type
CREATE OR REPLACE VIEW active_system_settings AS
SELECT
    setting_type,
    setting_key,
    setting_value,
    setting_name,
    description,
    created_at
FROM system_settings
WHERE is_active = TRUE
ORDER BY setting_type, setting_key;
