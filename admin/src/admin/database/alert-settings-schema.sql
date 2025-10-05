-- Stock Alert Settings Table
-- This table stores configuration for inventory alert thresholds and notifications

CREATE TABLE IF NOT EXISTS inventory_alert_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Global thresholds (percentage of max stock level)
    low_stock_threshold INTEGER DEFAULT 20 NOT NULL CHECK (low_stock_threshold >= 0 AND low_stock_threshold <= 100),
    critical_stock_threshold INTEGER DEFAULT 5 NOT NULL CHECK (critical_stock_threshold >= 0 AND critical_stock_threshold <= 100),
    
    -- Notification settings
    email_notifications BOOLEAN DEFAULT true NOT NULL,
    dashboard_notifications BOOLEAN DEFAULT true NOT NULL,
    notification_frequency TEXT DEFAULT 'immediate' NOT NULL CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
    
    -- Email recipients (stored as JSON array)
    email_recipients JSONB DEFAULT '[]' NOT NULL,
    
    -- Auto-reorder settings
    auto_reorder_enabled BOOLEAN DEFAULT false NOT NULL,
    reorder_buffer_percentage INTEGER DEFAULT 10 NOT NULL CHECK (reorder_buffer_percentage >= 0 AND reorder_buffer_percentage <= 100),
    
    -- Category-specific thresholds (stored as JSON object)
    category_specific_thresholds JSONB DEFAULT '{}' NOT NULL,
    
    -- Product-specific thresholds (stored as JSON object)
    product_specific_thresholds JSONB DEFAULT '{}' NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_alert_settings_updated_at ON inventory_alert_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_alert_settings_updated_by ON inventory_alert_settings(updated_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_alert_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_inventory_alert_settings_updated_at ON inventory_alert_settings;
CREATE TRIGGER trigger_update_inventory_alert_settings_updated_at
    BEFORE UPDATE ON inventory_alert_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_alert_settings_updated_at();

-- Insert default settings if none exist
INSERT INTO inventory_alert_settings (
    low_stock_threshold,
    critical_stock_threshold,
    email_notifications,
    dashboard_notifications,
    notification_frequency,
    email_recipients,
    auto_reorder_enabled,
    reorder_buffer_percentage,
    category_specific_thresholds,
    product_specific_thresholds
) VALUES (
    20,  -- low_stock_threshold
    5,   -- critical_stock_threshold
    true,  -- email_notifications
    true,  -- dashboard_notifications
    'immediate',  -- notification_frequency
    '[]',  -- email_recipients
    false,  -- auto_reorder_enabled
    10,   -- reorder_buffer_percentage
    '{}',  -- category_specific_thresholds
    '{}'   -- product_specific_thresholds
) ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your RLS policy)
-- ALTER TABLE inventory_alert_settings ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (uncomment and adjust as needed)
-- CREATE POLICY "Users can view alert settings" ON inventory_alert_settings
--     FOR SELECT USING (true);

-- CREATE POLICY "Authenticated users can update alert settings" ON inventory_alert_settings
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can insert alert settings" ON inventory_alert_settings
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE inventory_alert_settings IS 'Stores configuration for inventory alert thresholds and notification settings';
COMMENT ON COLUMN inventory_alert_settings.low_stock_threshold IS 'Percentage threshold for low stock alerts (0-100)';
COMMENT ON COLUMN inventory_alert_settings.critical_stock_threshold IS 'Percentage threshold for critical stock alerts (0-100)';
COMMENT ON COLUMN inventory_alert_settings.email_notifications IS 'Whether to send email notifications for stock alerts';
COMMENT ON COLUMN inventory_alert_settings.dashboard_notifications IS 'Whether to show notifications in the dashboard';
COMMENT ON COLUMN inventory_alert_settings.notification_frequency IS 'How often to send notifications: immediate, daily, or weekly';
COMMENT ON COLUMN inventory_alert_settings.email_recipients IS 'JSON array of email addresses to receive notifications';
COMMENT ON COLUMN inventory_alert_settings.auto_reorder_enabled IS 'Whether to automatically create reorder requests';
COMMENT ON COLUMN inventory_alert_settings.reorder_buffer_percentage IS 'Extra percentage to add to reorder quantities';
COMMENT ON COLUMN inventory_alert_settings.category_specific_thresholds IS 'JSON object with category-specific threshold overrides';
COMMENT ON COLUMN inventory_alert_settings.product_specific_thresholds IS 'JSON object with product-specific threshold overrides';
