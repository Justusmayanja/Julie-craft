-- Complete Robust Inventory Database Setup
-- This script sets up all tables, columns, functions, and policies for the robust inventory system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Add robust inventory columns to existing products table
DO $$ 
BEGIN
    -- Add physical_stock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'physical_stock') THEN
        ALTER TABLE products ADD COLUMN physical_stock INTEGER DEFAULT 0;
    END IF;
    
    -- Add reserved_stock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reserved_stock') THEN
        ALTER TABLE products ADD COLUMN reserved_stock INTEGER DEFAULT 0;
    END IF;
    
    -- Add available_stock computed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'available_stock') THEN
        ALTER TABLE products ADD COLUMN available_stock INTEGER GENERATED ALWAYS AS (physical_stock - reserved_stock) STORED;
    END IF;
    
    -- Add reorder_point column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reorder_point') THEN
        ALTER TABLE products ADD COLUMN reorder_point INTEGER DEFAULT 10;
    END IF;
    
    -- Add max_stock_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'max_stock_level') THEN
        ALTER TABLE products ADD COLUMN max_stock_level INTEGER DEFAULT 1000;
    END IF;
    
    -- Add stock_status computed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_status') THEN
        ALTER TABLE products ADD COLUMN stock_status TEXT GENERATED ALWAYS AS (
            CASE 
                WHEN available_stock <= 0 THEN 'out_of_stock'
                WHEN available_stock <= reorder_point THEN 'low_stock'
                WHEN reserved_stock > 0 THEN 'reserved'
                ELSE 'in_stock'
            END
        ) STORED;
    END IF;
    
    -- Add last_stock_update column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'last_stock_update') THEN
        ALTER TABLE products ADD COLUMN last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add version column for optimistic locking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'version') THEN
        ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- Update existing products with default values
UPDATE products SET 
    physical_stock = COALESCE(physical_stock, 0),
    reserved_stock = COALESCE(reserved_stock, 0),
    reorder_point = COALESCE(reorder_point, 10),
    max_stock_level = COALESCE(max_stock_level, 1000),
    last_stock_update = COALESCE(last_stock_update, NOW()),
    version = COALESCE(version, 1)
WHERE physical_stock IS NULL OR reserved_stock IS NULL OR reorder_point IS NULL OR max_stock_level IS NULL OR last_stock_update IS NULL OR version IS NULL;

-- 2. Create inventory_audit_log table
CREATE TABLE IF NOT EXISTS inventory_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3. Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 4. Create stock_reservations table
CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired'))
);

-- 5. Create reorder_alerts table
CREATE TABLE IF NOT EXISTS reorder_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'reorder_point_reached')),
    current_stock INTEGER NOT NULL,
    reorder_point INTEGER NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 6. Create inventory_alert_settings table
CREATE TABLE IF NOT EXISTS inventory_alert_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Insert default alert settings if none exist
INSERT INTO inventory_alert_settings (id) 
SELECT uuid_generate_v4()
WHERE NOT EXISTS (SELECT 1 FROM inventory_alert_settings);

-- 7. Add constraints to ensure data integrity
DO $$ 
BEGIN
    -- Add constraints to products table
    BEGIN
        ALTER TABLE products ADD CONSTRAINT check_physical_stock_positive CHECK (physical_stock >= 0);
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists
    END;
    
    BEGIN
        ALTER TABLE products ADD CONSTRAINT check_reserved_stock_positive CHECK (reserved_stock >= 0);
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists
    END;
    
    BEGIN
        ALTER TABLE products ADD CONSTRAINT check_reserved_not_exceed_physical CHECK (reserved_stock <= physical_stock);
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists
    END;
    
    BEGIN
        ALTER TABLE products ADD CONSTRAINT check_reorder_point_positive CHECK (reorder_point >= 0);
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists
    END;
    
    BEGIN
        ALTER TABLE products ADD CONSTRAINT check_max_stock_positive CHECK (max_stock_level > 0);
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists
    END;
END $$;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_product_id ON inventory_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_created_at ON inventory_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_operation_type ON inventory_audit_log(operation_type);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_approval_status ON inventory_adjustments(approval_status);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_id ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_order_id ON stock_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON stock_reservations(status);

CREATE INDEX IF NOT EXISTS idx_reorder_alerts_product_id ON reorder_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_reorder_alerts_is_resolved ON reorder_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_available_stock ON products(available_stock);

-- 9. Create atomic stock operation functions
CREATE OR REPLACE FUNCTION reserve_stock_for_order(
    p_product_id UUID,
    p_order_id UUID,
    p_quantity INTEGER,
    p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    current_physical INTEGER;
    current_reserved INTEGER;
    current_available INTEGER;
    current_version INTEGER;
    new_reserved INTEGER;
    new_available INTEGER;
BEGIN
    -- Lock the product row for update
    SELECT physical_stock, reserved_stock, available_stock, version
    INTO current_physical, current_reserved, current_available, current_version
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    -- Check if product exists
    IF current_physical IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found',
            'error_code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Check if sufficient stock is available
    IF current_available < p_quantity THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient stock available',
            'error_code', 'INSUFFICIENT_STOCK',
            'available_stock', current_available,
            'requested_quantity', p_quantity
        );
    END IF;
    
    -- Calculate new values
    new_reserved := current_reserved + p_quantity;
    new_available := current_physical - new_reserved;
    
    -- Update product stock
    UPDATE products SET
        reserved_stock = new_reserved,
        version = version + 1,
        last_stock_update = NOW()
    WHERE id = p_product_id AND version = current_version;
    
    -- Check if update was successful (optimistic locking)
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Concurrent modification detected. Please retry.',
            'error_code', 'CONCURRENT_MODIFICATION'
        );
    END IF;
    
    -- Create reservation record
    INSERT INTO stock_reservations (product_id, order_id, quantity, user_id)
    VALUES (p_product_id, p_order_id, p_quantity, p_user_id);
    
    -- Create audit log entry
    INSERT INTO inventory_audit_log (
        product_id, operation_type, physical_stock_before, physical_stock_after,
        reserved_stock_before, reserved_stock_after, operation_reason, order_id, user_id
    ) VALUES (
        p_product_id, 'order_reservation', current_physical, current_physical,
        current_reserved, new_reserved, 'Order reservation', p_order_id, p_user_id
    );
    
    RETURN json_build_object(
        'success', true,
        'reservation_id', (SELECT id FROM stock_reservations WHERE product_id = p_product_id AND order_id = p_order_id ORDER BY created_at DESC LIMIT 1),
        'available_stock_after', new_available,
        'reserved_stock_after', new_reserved
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fulfill_order_stock(
    p_product_id UUID,
    p_order_id UUID,
    p_quantity INTEGER,
    p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    current_physical INTEGER;
    current_reserved INTEGER;
    current_version INTEGER;
    new_physical INTEGER;
    new_reserved INTEGER;
    reservation_exists BOOLEAN;
BEGIN
    -- Lock the product row for update
    SELECT physical_stock, reserved_stock, version
    INTO current_physical, current_reserved, current_version
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    -- Check if product exists
    IF current_physical IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found',
            'error_code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Check if reservation exists
    SELECT EXISTS(SELECT 1 FROM stock_reservations WHERE product_id = p_product_id AND order_id = p_order_id AND status = 'active')
    INTO reservation_exists;
    
    IF NOT reservation_exists THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No active reservation found for this order',
            'error_code', 'NO_RESERVATION'
        );
    END IF;
    
    -- Calculate new values
    new_physical := current_physical - p_quantity;
    new_reserved := current_reserved - p_quantity;
    
    -- Validate stock levels
    IF new_physical < 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient physical stock for fulfillment',
            'error_code', 'INSUFFICIENT_PHYSICAL_STOCK'
        );
    END IF;
    
    -- Update product stock
    UPDATE products SET
        physical_stock = new_physical,
        reserved_stock = new_reserved,
        version = version + 1,
        last_stock_update = NOW()
    WHERE id = p_product_id AND version = current_version;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Concurrent modification detected. Please retry.',
            'error_code', 'CONCURRENT_MODIFICATION'
        );
    END IF;
    
    -- Update reservation status
    UPDATE stock_reservations SET
        status = 'fulfilled'
    WHERE product_id = p_product_id AND order_id = p_order_id AND status = 'active';
    
    -- Create audit log entry
    INSERT INTO inventory_audit_log (
        product_id, operation_type, physical_stock_before, physical_stock_after,
        reserved_stock_before, reserved_stock_after, operation_reason, order_id, user_id
    ) VALUES (
        p_product_id, 'order_fulfillment', current_physical, new_physical,
        current_reserved, new_reserved, 'Order fulfillment', p_order_id, p_user_id
    );
    
    RETURN json_build_object(
        'success', true,
        'physical_stock_after', new_physical,
        'reserved_stock_after', new_reserved
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cancel_order_reservation(
    p_product_id UUID,
    p_order_id UUID,
    p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    current_physical INTEGER;
    current_reserved INTEGER;
    current_version INTEGER;
    reservation_quantity INTEGER;
    new_reserved INTEGER;
BEGIN
    -- Lock the product row for update
    SELECT physical_stock, reserved_stock, version
    INTO current_physical, current_reserved, current_version
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    -- Check if product exists
    IF current_physical IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found',
            'error_code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Get reservation quantity
    SELECT quantity INTO reservation_quantity
    FROM stock_reservations
    WHERE product_id = p_product_id AND order_id = p_order_id AND status = 'active';
    
    IF reservation_quantity IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No active reservation found for this order',
            'error_code', 'NO_RESERVATION'
        );
    END IF;
    
    -- Calculate new reserved stock
    new_reserved := current_reserved - reservation_quantity;
    
    -- Update product stock
    UPDATE products SET
        reserved_stock = new_reserved,
        version = version + 1,
        last_stock_update = NOW()
    WHERE id = p_product_id AND version = current_version;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Concurrent modification detected. Please retry.',
            'error_code', 'CONCURRENT_MODIFICATION'
        );
    END IF;
    
    -- Update reservation status
    UPDATE stock_reservations SET
        status = 'cancelled'
    WHERE product_id = p_product_id AND order_id = p_order_id AND status = 'active';
    
    -- Create audit log entry
    INSERT INTO inventory_audit_log (
        product_id, operation_type, physical_stock_before, physical_stock_after,
        reserved_stock_before, reserved_stock_after, operation_reason, order_id, user_id
    ) VALUES (
        p_product_id, 'order_cancellation', current_physical, current_physical,
        current_reserved, new_reserved, 'Order cancellation', p_order_id, p_user_id
    );
    
    RETURN json_build_object(
        'success', true,
        'reserved_stock_after', new_reserved,
        'available_stock_after', current_physical - new_reserved
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_product_return(
    p_product_id UUID,
    p_order_id UUID,
    p_quantity INTEGER,
    p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    current_physical INTEGER;
    current_reserved INTEGER;
    current_version INTEGER;
    new_physical INTEGER;
BEGIN
    -- Lock the product row for update
    SELECT physical_stock, reserved_stock, version
    INTO current_physical, current_reserved, current_version
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    -- Check if product exists
    IF current_physical IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found',
            'error_code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Calculate new physical stock
    new_physical := current_physical + p_quantity;
    
    -- Update product stock
    UPDATE products SET
        physical_stock = new_physical,
        version = version + 1,
        last_stock_update = NOW()
    WHERE id = p_product_id AND version = current_version;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Concurrent modification detected. Please retry.',
            'error_code', 'CONCURRENT_MODIFICATION'
        );
    END IF;
    
    -- Create audit log entry
    INSERT INTO inventory_audit_log (
        product_id, operation_type, physical_stock_before, physical_stock_after,
        reserved_stock_before, reserved_stock_after, operation_reason, order_id, user_id
    ) VALUES (
        p_product_id, 'return_processing', current_physical, new_physical,
        current_reserved, current_reserved, 'Product return', p_order_id, p_user_id
    );
    
    RETURN json_build_object(
        'success', true,
        'physical_stock_after', new_physical,
        'available_stock_after', new_physical - current_reserved
    );
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for automatic stock status updates
CREATE OR REPLACE FUNCTION update_stock_status() RETURNS TRIGGER AS $$
BEGIN
    -- Trigger will automatically update computed columns
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_status
    AFTER UPDATE OF physical_stock, reserved_stock, reorder_point ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_status();

-- 11. Create function to check and create reorder alerts
CREATE OR REPLACE FUNCTION check_reorder_alerts() RETURNS VOID AS $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN 
        SELECT id, available_stock, reorder_point, physical_stock
        FROM products
        WHERE available_stock <= reorder_point
        AND id NOT IN (
            SELECT product_id FROM reorder_alerts 
            WHERE is_resolved = FALSE
        )
    LOOP
        INSERT INTO reorder_alerts (
            product_id, alert_type, current_stock, reorder_point
        ) VALUES (
            product_record.id,
            CASE 
                WHEN product_record.available_stock <= 0 THEN 'out_of_stock'
                ELSE 'low_stock'
            END,
            product_record.available_stock,
            product_record.reorder_point
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 12. Enable Row Level Security (RLS) policies
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alert_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON inventory_audit_log
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON inventory_adjustments
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON stock_reservations
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON reorder_alerts
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON inventory_alert_settings
    FOR ALL TO authenticated USING (true);

-- 13. Run initial reorder alert check
SELECT check_reorder_alerts();

-- 14. Update all existing products to have proper stock values
UPDATE products SET 
    physical_stock = GREATEST(COALESCE(stock_quantity, 0), 0),
    reserved_stock = 0,
    reorder_point = GREATEST(COALESCE(reorder_point, 10), 0),
    max_stock_level = GREATEST(COALESCE(max_stock_level, 1000), 1),
    last_stock_update = NOW(),
    version = 1
WHERE physical_stock IS NULL OR reserved_stock IS NULL;

-- 15. Create a view for easy inventory reporting
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.physical_stock,
    p.reserved_stock,
    p.available_stock,
    p.reorder_point,
    p.max_stock_level,
    p.stock_status,
    p.unit_cost,
    p.unit_price,
    p.last_stock_update,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Robust inventory system setup completed successfully!';
    RAISE NOTICE 'Tables created: inventory_audit_log, inventory_adjustments, stock_reservations, reorder_alerts, inventory_alert_settings';
    RAISE NOTICE 'Columns added to products: physical_stock, reserved_stock, available_stock, reorder_point, max_stock_level, stock_status, last_stock_update, version';
    RAISE NOTICE 'Functions created: reserve_stock_for_order, fulfill_order_stock, cancel_order_reservation, process_product_return, check_reorder_alerts';
    RAISE NOTICE 'Indexes and constraints added for optimal performance';
END $$;
