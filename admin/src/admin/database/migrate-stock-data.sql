-- Migrate existing stock data to robust inventory system
-- This script copies stock_quantity to physical_stock and sets up proper values

-- 1. First, ensure the robust inventory columns exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS physical_stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 2. Migrate existing stock_quantity to physical_stock where physical_stock is 0 or NULL
UPDATE products 
SET 
  physical_stock = COALESCE(stock_quantity, 0),
  reserved_stock = 0,
  reorder_point = COALESCE(min_stock_level, 10),
  max_stock_level = 1000,
  last_stock_update = NOW(),
  version = 1
WHERE physical_stock IS NULL OR physical_stock = 0;

-- 3. Create the inventory_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('stock_adjustment', 'reservation', 'fulfillment', 'cancellation', 'return', 'receive')),
  physical_stock_before INTEGER NOT NULL,
  physical_stock_after INTEGER NOT NULL,
  physical_stock_change INTEGER NOT NULL,
  reserved_stock_before INTEGER DEFAULT 0,
  reserved_stock_after INTEGER DEFAULT 0,
  reserved_stock_change INTEGER DEFAULT 0,
  operation_reason TEXT,
  order_id UUID,
  admin_user_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the inventory_adjustments table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('physical_count', 'damage_writeoff', 'theft_loss', 'counting_error', 'manual_correction', 'supplier_return', 'quality_control_reject')),
  reason_code TEXT NOT NULL,
  quantity_adjusted INTEGER NOT NULL,
  previous_physical_stock INTEGER NOT NULL,
  new_physical_stock INTEGER NOT NULL,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  description TEXT,
  supporting_documents TEXT[],
  requested_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 5. Create the inventory_alert_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_alert_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  low_stock_threshold INTEGER DEFAULT 20,
  critical_stock_threshold INTEGER DEFAULT 5,
  reorder_buffer_percentage INTEGER DEFAULT 10,
  dashboard_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  auto_reorder BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'immediate',
  email_recipients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default alert settings if none exist
INSERT INTO inventory_alert_settings (id) 
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM inventory_alert_settings);

-- 7. Enable RLS on new tables
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alert_settings ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
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

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_product_id ON inventory_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_created_at ON inventory_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_status ON inventory_adjustments(approval_status);

-- 10. Show summary of migrated data
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN physical_stock > 0 THEN 1 END) as products_with_stock,
  SUM(physical_stock) as total_physical_stock,
  SUM(reserved_stock) as total_reserved_stock
FROM products;
