-- =====================================================
-- Migration Script: Upgrade to Enhanced Inventory System
-- =====================================================
-- This script safely migrates your existing inventory system to the enhanced version
-- Run this script to upgrade your existing database

-- =====================================================
-- STEP 1: BACKUP EXISTING DATA (RECOMMENDED)
-- =====================================================
-- Before running this migration, backup your existing data:
-- pg_dump your_database > backup_before_enhanced_inventory.sql

-- =====================================================
-- STEP 2: CREATE NEW TABLES
-- =====================================================

-- Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'set')),
    quantity_before INTEGER NOT NULL DEFAULT 0,
    quantity_after INTEGER NOT NULL DEFAULT 0,
    quantity_change INTEGER NOT NULL DEFAULT 0,
    reason TEXT NOT NULL CHECK (reason IN ('received', 'damaged', 'lost', 'correction', 'return', 'sale', 'transfer', 'other')),
    notes TEXT,
    reference TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Uganda',
    postal_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    description TEXT,
    capacity INTEGER,
    current_utilization INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Uganda',
    postal_code TEXT,
    payment_terms TEXT,
    lead_time_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_reservations table
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    reservation_type TEXT NOT NULL CHECK (reservation_type IN ('order', 'hold', 'transfer', 'other')),
    reason TEXT,
    reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: ADD NEW COLUMNS TO EXISTING PRODUCTS TABLE
-- =====================================================

-- Add location and warehouse references
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add enhanced inventory fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS last_restocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS average_daily_sales DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS safety_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS abc_classification TEXT CHECK (abc_classification IN ('A', 'B', 'C')) DEFAULT 'C';

-- Add inventory tracking fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS total_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_adjusted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_turnover_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS days_in_stock INTEGER DEFAULT 0;

-- Add computed column for available quantity
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED;

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

-- Inventory adjustments indexes
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_user_id ON inventory_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_reason ON inventory_adjustments(reason);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON inventory_adjustments(adjustment_type);

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

-- Warehouses indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON warehouses(name);
CREATE INDEX IF NOT EXISTS idx_warehouses_location_id ON warehouses(location_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_active ON warehouses(is_active);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- Inventory reservations indexes
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id ON inventory_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_expires_at ON inventory_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_is_active ON inventory_reservations(is_active);

-- Enhanced products indexes
CREATE INDEX IF NOT EXISTS idx_products_location_id ON products(location_id);
CREATE INDEX IF NOT EXISTS idx_products_warehouse_id ON products(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_reserved_quantity ON products(reserved_quantity);
CREATE INDEX IF NOT EXISTS idx_products_available_quantity ON products(available_quantity);
CREATE INDEX IF NOT EXISTS idx_products_abc_classification ON products(abc_classification);
CREATE INDEX IF NOT EXISTS idx_products_last_restocked_at ON products(last_restocked_at);
CREATE INDEX IF NOT EXISTS idx_products_last_sold_at ON products(last_sold_at);

-- =====================================================
-- STEP 5: INSERT DEFAULT DATA
-- =====================================================

-- Insert default location
INSERT INTO locations (id, name, description, address, city, state, country) 
SELECT '550e8400-e29b-41d4-a716-446655440001', 'Main Warehouse', 'Primary storage facility', '123 Industrial Road', 'Kampala', 'Central', 'Uganda'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Main Warehouse');

-- Insert default warehouse
INSERT INTO warehouses (id, name, location_id, description, capacity, current_utilization) 
SELECT '660e8400-e29b-41d4-a716-446655440001', 'Main Warehouse', '550e8400-e29b-41d4-a716-446655440001', 'Primary warehouse for bulk storage', 10000, 0
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE name = 'Main Warehouse');

-- Insert default supplier
INSERT INTO suppliers (id, name, contact_person, email, phone, address, city, state, country, payment_terms, lead_time_days) 
SELECT '770e8400-e29b-41d4-a716-446655440001', 'Default Supplier', 'John Doe', 'supplier@example.com', '+256-700-000-000', '100 Supplier Street', 'Kampala', 'Central', 'Uganda', 'Net 30', 7
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Default Supplier');

-- =====================================================
-- STEP 6: UPDATE EXISTING PRODUCTS
-- =====================================================

-- Update existing products with default values
UPDATE products 
SET 
    location_id = '550e8400-e29b-41d4-a716-446655440001',
    warehouse_id = '660e8400-e29b-41d4-a716-446655440001',
    supplier_id = '770e8400-e29b-41d4-a716-446655440001',
    reserved_quantity = 0,
    reorder_quantity = COALESCE(reorder_point, 10),
    safety_stock = COALESCE(min_stock_level, 5),
    abc_classification = 'C'
WHERE location_id IS NULL;

-- =====================================================
-- STEP 7: CREATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trigger_update_inventory_adjustments_updated_at
    BEFORE UPDATE ON inventory_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_inventory_reservations_updated_at
    BEFORE UPDATE ON inventory_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: CREATE VIEWS
-- =====================================================

-- Enhanced inventory summary view
CREATE OR REPLACE VIEW enhanced_inventory_summary AS
SELECT 
    p.id,
    p.name as product_name,
    p.sku,
    p.description,
    p.stock_quantity as current_quantity,
    p.reserved_quantity,
    p.available_quantity,
    p.min_stock_level,
    p.max_stock_level,
    p.reorder_point,
    p.reorder_quantity,
    p.safety_stock,
    p.price as unit_price,
    p.cost_price as unit_cost,
    (p.stock_quantity * p.cost_price) as total_value,
    p.weight,
    p.dimensions,
    p.barcode,
    p.notes as product_notes,
    p.abc_classification,
    p.stock_turnover_rate,
    p.average_daily_sales,
    p.days_in_stock,
    p.last_restocked_at,
    p.last_sold_at,
    p.updated_at as last_updated,
    p.created_at,
    -- Status calculation
    CASE 
        WHEN p.stock_quantity = 0 THEN 'out_of_stock'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock'
        WHEN p.stock_quantity <= p.reorder_point THEN 'below_reorder'
        ELSE 'in_stock'
    END as status,
    -- Below reorder point flag
    p.stock_quantity <= p.reorder_point as below_reorder_point,
    -- Category information
    c.name as category_name,
    c.id as category_id,
    -- Location information
    l.name as location_name,
    l.id as location_id,
    -- Warehouse information
    w.name as warehouse_name,
    w.id as warehouse_id,
    -- Supplier information
    s.name as supplier_name,
    s.id as supplier_id,
    s.contact_person as supplier_contact,
    s.phone as supplier_phone,
    s.email as supplier_email,
    -- Latest adjustment info
    ia.adjustment_type as last_adjustment_type,
    ia.quantity_change as last_quantity_change,
    ia.created_at as last_adjustment_date,
    ia.user_name as last_adjusted_by,
    ia.reason as last_adjustment_reason
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN warehouses w ON p.warehouse_id = w.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN LATERAL (
    SELECT 
        adjustment_type,
        quantity_change,
        created_at,
        user_name,
        reason
    FROM inventory_adjustments 
    WHERE product_id = p.id 
    ORDER BY created_at DESC 
    LIMIT 1
) ia ON true;

-- Inventory alerts view
CREATE OR REPLACE VIEW inventory_alerts AS
SELECT 
    p.id,
    p.name as product_name,
    p.sku,
    p.stock_quantity,
    p.min_stock_level,
    p.reorder_point,
    p.available_quantity,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'out_of_stock'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock'
        WHEN p.stock_quantity <= p.reorder_point THEN 'below_reorder'
        ELSE 'in_stock'
    END as alert_type,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Critical: Out of Stock'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'Warning: Low Stock'
        WHEN p.stock_quantity <= p.reorder_point THEN 'Info: Below Reorder Point'
        ELSE 'OK: In Stock'
    END as alert_message,
    p.reorder_quantity as suggested_reorder_qty,
    s.name as supplier_name,
    s.phone as supplier_phone,
    s.email as supplier_email
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.stock_quantity <= p.reorder_point
ORDER BY 
    CASE 
        WHEN p.stock_quantity = 0 THEN 1
        WHEN p.stock_quantity <= p.min_stock_level THEN 2
        WHEN p.stock_quantity <= p.reorder_point THEN 3
        ELSE 4
    END,
    p.stock_quantity ASC;

-- =====================================================
-- STEP 9: CREATE USEFUL FUNCTIONS
-- =====================================================

-- Function to calculate available quantity
CREATE OR REPLACE FUNCTION calculate_available_quantity(product_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_stock INTEGER;
    reserved_qty INTEGER;
BEGIN
    -- Get current stock quantity
    SELECT stock_quantity INTO current_stock
    FROM products
    WHERE id = product_uuid;
    
    -- Get total reserved quantity
    SELECT COALESCE(SUM(quantity_reserved), 0) INTO reserved_qty
    FROM inventory_reservations
    WHERE product_id = product_uuid AND is_active = true;
    
    RETURN COALESCE(current_stock, 0) - COALESCE(reserved_qty, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to adjust inventory with automatic logging
CREATE OR REPLACE FUNCTION adjust_inventory(
    p_product_id UUID,
    p_adjustment_type TEXT,
    p_quantity INTEGER,
    p_reason TEXT,
    p_notes TEXT DEFAULT NULL,
    p_reference TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_user_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_product_name TEXT;
    v_quantity_before INTEGER;
    v_quantity_after INTEGER;
    v_quantity_change INTEGER;
    v_result JSON;
BEGIN
    -- Get product name and current quantity
    SELECT name, stock_quantity INTO v_product_name, v_quantity_before
    FROM products
    WHERE id = p_product_id;
    
    IF v_product_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Product not found');
    END IF;
    
    -- Calculate new quantity
    CASE p_adjustment_type
        WHEN 'increase' THEN
            v_quantity_after := v_quantity_before + p_quantity;
        WHEN 'decrease' THEN
            v_quantity_after := GREATEST(0, v_quantity_before - p_quantity);
        WHEN 'set' THEN
            v_quantity_after := GREATEST(0, p_quantity);
        ELSE
            RETURN json_build_object('success', false, 'error', 'Invalid adjustment type');
    END CASE;
    
    v_quantity_change := v_quantity_after - v_quantity_before;
    
    -- Update product stock
    UPDATE products
    SET 
        stock_quantity = v_quantity_after,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Log the adjustment
    INSERT INTO inventory_adjustments (
        product_id,
        product_name,
        adjustment_type,
        quantity_before,
        quantity_after,
        quantity_change,
        reason,
        notes,
        reference,
        user_id,
        user_name
    ) VALUES (
        p_product_id,
        v_product_name,
        p_adjustment_type,
        v_quantity_before,
        v_quantity_after,
        v_quantity_change,
        p_reason,
        p_notes,
        p_reference,
        p_user_id,
        p_user_name
    );
    
    -- Return success result
    v_result := json_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'quantity_before', v_quantity_before,
        'quantity_after', v_quantity_after,
        'quantity_change', v_quantity_change,
        'adjustment_type', p_adjustment_type,
        'reason', p_reason
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 10: SET UP ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view inventory adjustments" ON inventory_adjustments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert inventory adjustments" ON inventory_adjustments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update inventory adjustments" ON inventory_adjustments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete inventory adjustments" ON inventory_adjustments
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage locations" ON locations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage warehouses" ON warehouses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage suppliers" ON suppliers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage inventory reservations" ON inventory_reservations
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- STEP 11: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on tables
GRANT ALL ON inventory_adjustments TO authenticated;
GRANT ALL ON locations TO authenticated;
GRANT ALL ON warehouses TO authenticated;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON inventory_reservations TO authenticated;

-- Grant permissions on views
GRANT SELECT ON enhanced_inventory_summary TO authenticated;
GRANT SELECT ON inventory_alerts TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION calculate_available_quantity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_inventory(UUID, TEXT, INTEGER, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- =====================================================
-- STEP 12: VERIFICATION QUERIES
-- =====================================================

-- Verify the migration was successful
DO $$
BEGIN
    -- Check if all tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_adjustments') THEN
        RAISE EXCEPTION 'inventory_adjustments table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locations') THEN
        RAISE EXCEPTION 'locations table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') THEN
        RAISE EXCEPTION 'warehouses table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE EXCEPTION 'suppliers table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_reservations') THEN
        RAISE EXCEPTION 'inventory_reservations table not created';
    END IF;
    
    -- Check if new columns were added to products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'location_id') THEN
        RAISE EXCEPTION 'location_id column not added to products table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reserved_quantity') THEN
        RAISE EXCEPTION 'reserved_quantity column not added to products table';
    END IF;
    
    -- Check if views exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'enhanced_inventory_summary') THEN
        RAISE EXCEPTION 'enhanced_inventory_summary view not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'inventory_alerts') THEN
        RAISE EXCEPTION 'inventory_alerts view not created';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Your database has been successfully upgraded to the enhanced inventory system!
-- 
-- New features available:
-- 1. Complete inventory adjustment tracking
-- 2. Location and warehouse management
-- 3. Supplier management
-- 4. Inventory reservations
-- 5. Enhanced product fields
-- 6. Automated calculations and views
-- 7. Row Level Security
-- 8. Useful stored procedures
--
-- Next steps:
-- 1. Update your API endpoints to use the new tables
-- 2. Test the new functionality
-- 3. Update your frontend to use the enhanced features
-- 4. Train users on the new inventory management features

COMMIT;
