-- =====================================================
-- Enhanced Inventory System - Fixed Setup Script
-- =====================================================
-- This script sets up the enhanced inventory system without ON CONFLICT issues
-- Run this script for new installations

-- =====================================================
-- 1. CREATE CORE TABLES
-- =====================================================

-- Locations table
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

-- Warehouses table
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

-- Suppliers table
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

-- Inventory adjustments table
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

-- Inventory reservations table
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
-- 2. ENHANCE PRODUCTS TABLE
-- =====================================================

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
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
ADD COLUMN IF NOT EXISTS abc_classification TEXT CHECK (abc_classification IN ('A', 'B', 'C')) DEFAULT 'C',
ADD COLUMN IF NOT EXISTS total_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_adjusted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_turnover_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS days_in_stock INTEGER DEFAULT 0;

-- Add computed column for available quantity
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON warehouses(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id ON inventory_reservations(product_id);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_location_id ON products(location_id);
CREATE INDEX IF NOT EXISTS idx_products_warehouse_id ON products(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_reserved_quantity ON products(reserved_quantity);
CREATE INDEX IF NOT EXISTS idx_products_available_quantity ON products(available_quantity);

-- =====================================================
-- 4. INSERT DEFAULT DATA (SAFE VERSION)
-- =====================================================

-- Insert default location only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Main Warehouse') THEN
        INSERT INTO locations (id, name, description, address, city, state, country) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'Main Warehouse', 'Primary storage facility', '123 Industrial Road', 'Kampala', 'Central', 'Uganda');
    END IF;
END $$;

-- Insert default warehouse only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM warehouses WHERE name = 'Main Warehouse') THEN
        INSERT INTO warehouses (id, name, location_id, description, capacity, current_utilization) VALUES
        ('660e8400-e29b-41d4-a716-446655440001', 'Main Warehouse', '550e8400-e29b-41d4-a716-446655440001', 'Primary warehouse for bulk storage', 10000, 0);
    END IF;
END $$;

-- Insert default supplier only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Default Supplier') THEN
        INSERT INTO suppliers (id, name, contact_person, email, phone, address, city, state, country, payment_terms, lead_time_days) VALUES
        ('770e8400-e29b-41d4-a716-446655440001', 'Default Supplier', 'John Doe', 'supplier@example.com', '+256-700-000-000', '100 Supplier Street', 'Kampala', 'Central', 'Uganda', 'Net 30', 7);
    END IF;
END $$;

-- =====================================================
-- 5. UPDATE EXISTING PRODUCTS
-- =====================================================

-- Set default values for existing products
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
-- 6. CREATE TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
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

CREATE TRIGGER trigger_update_inventory_adjustments_updated_at
    BEFORE UPDATE ON inventory_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_inventory_reservations_updated_at
    BEFORE UPDATE ON inventory_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. CREATE VIEWS
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
-- 8. CREATE USEFUL FUNCTIONS
-- =====================================================

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
-- 9. SET UP SECURITY
-- =====================================================

-- Enable Row Level Security
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to manage inventory adjustments" ON inventory_adjustments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage locations" ON locations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage warehouses" ON warehouses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage suppliers" ON suppliers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage inventory reservations" ON inventory_reservations
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 10. GRANT PERMISSIONS
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
GRANT EXECUTE ON FUNCTION adjust_inventory(UUID, TEXT, INTEGER, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Your enhanced inventory system is now ready!
-- 
-- Features available:
-- ✅ Complete inventory tracking
-- ✅ Location and warehouse management
-- ✅ Supplier management
-- ✅ Stock adjustments with audit trail
-- ✅ Inventory reservations
-- ✅ Enhanced product fields
-- ✅ Automated calculations
-- ✅ Security policies
-- ✅ Useful functions and views
--
-- Next steps:
-- 1. Test the system with sample data
-- 2. Update your API endpoints
-- 3. Configure your frontend
-- 4. Train your users

COMMIT;
