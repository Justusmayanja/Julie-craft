-- Manual Database Setup for Robust Inventory System
-- Run this script directly in your Supabase SQL editor or psql

-- 1. Add physical_stock column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS physical_stock INTEGER DEFAULT 0;

-- 2. Add reserved_stock column to products table  
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0;

-- 3. Add reorder_point column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10;

-- 4. Add max_stock_level column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;

-- 5. Add last_stock_update column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Add version column for optimistic locking
ALTER TABLE products ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 7. Add available_stock computed column
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_stock INTEGER GENERATED ALWAYS AS (physical_stock - reserved_stock) STORED;

-- 8. Add stock_status computed column
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN (physical_stock - reserved_stock) <= 0 THEN 'out_of_stock'
    WHEN (physical_stock - reserved_stock) <= reorder_point THEN 'low_stock'
    WHEN reserved_stock > 0 THEN 'reserved'
    ELSE 'in_stock'
  END
) STORED;

-- 9. Update existing products with default values
UPDATE products SET 
  physical_stock = COALESCE(stock_quantity, 0),
  reserved_stock = 0,
  reorder_point = 10,
  max_stock_level = 1000,
  last_stock_update = NOW(),
  version = 1
WHERE physical_stock IS NULL OR reserved_stock IS NULL;

-- 10. Create inventory_alert_settings table
CREATE TABLE IF NOT EXISTS inventory_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  low_stock_threshold DECIMAL(5,2) DEFAULT 20.0,
  critical_stock_threshold DECIMAL(5,2) DEFAULT 5.0,
  reorder_buffer_percentage DECIMAL(5,2) DEFAULT 10.0,
  dashboard_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  auto_reorder BOOLEAN DEFAULT FALSE,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
  email_recipients TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Insert default alert settings if none exist
INSERT INTO inventory_alert_settings (id) 
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM inventory_alert_settings);

-- 12. Create inventory_audit_log table
CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('stock_adjustment', 'order_reservation', 'order_fulfillment', 'order_cancellation', 'return_processing', 'damage_writeoff', 'theft_loss', 'counting_error')),
  physical_stock_before INTEGER NOT NULL,
  physical_stock_after INTEGER NOT NULL,
  physical_stock_change INTEGER GENERATED ALWAYS AS (physical_stock_after - physical_stock_before) STORED,
  reserved_stock_before INTEGER NOT NULL DEFAULT 0,
  reserved_stock_after INTEGER NOT NULL DEFAULT 0,
  reserved_stock_change INTEGER GENERATED ALWAYS AS (reserved_stock_after - reserved_stock_before) STORED,
  operation_reason TEXT,
  order_id UUID,
  user_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('physical_count', 'damage_writeoff', 'theft_loss', 'counting_error', 'manual_correction', 'supplier_return', 'quality_control_reject')),
  reason_code TEXT NOT NULL,
  quantity_adjusted INTEGER NOT NULL,
  previous_physical_stock INTEGER NOT NULL,
  new_physical_stock INTEGER NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  description TEXT NOT NULL,
  supporting_documents TEXT[],
  requested_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  witness_user_id UUID
);

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_product_id ON inventory_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_created_at ON inventory_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_approval_status ON inventory_adjustments(approval_status);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

-- 15. Enable Row Level Security (RLS)
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alert_settings ENABLE ROW LEVEL SECURITY;

-- 16. Create RLS policies (allow all operations for authenticated users)
-- Drop existing policies first if they exist, then create new ones
DO $$ 
BEGIN
    -- Drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON inventory_audit_log;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON inventory_adjustments;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON inventory_alert_settings;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    -- Create new policies
    CREATE POLICY "Allow all operations for authenticated users" ON inventory_audit_log
        FOR ALL TO authenticated USING (true);
    
    CREATE POLICY "Allow all operations for authenticated users" ON inventory_adjustments
        FOR ALL TO authenticated USING (true);
    
    CREATE POLICY "Allow all operations for authenticated users" ON inventory_alert_settings
        FOR ALL TO authenticated USING (true);
END $$;

-- Success message
SELECT 'Robust inventory system setup completed successfully!' as message;
