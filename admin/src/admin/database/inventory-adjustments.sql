-- Create inventory_adjustments table for tracking stock movements
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
    reference TEXT, -- PO number, invoice number, etc.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_user_id ON inventory_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_reason ON inventory_adjustments(reason);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON inventory_adjustments(adjustment_type);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_adjustments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_inventory_adjustments_updated_at
    BEFORE UPDATE ON inventory_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_adjustments_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view all adjustments
CREATE POLICY "Allow authenticated users to view inventory adjustments" ON inventory_adjustments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert adjustments
CREATE POLICY "Allow authenticated users to insert inventory adjustments" ON inventory_adjustments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update adjustments (for corrections)
CREATE POLICY "Allow authenticated users to update inventory adjustments" ON inventory_adjustments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete adjustments (for corrections)
CREATE POLICY "Allow authenticated users to delete inventory adjustments" ON inventory_adjustments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data for testing
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
    user_name
) VALUES 
(
    (SELECT id FROM products LIMIT 1),
    'Sample Product',
    'increase',
    10,
    25,
    15,
    'received',
    'Initial stock received from supplier',
    'PO-2024-001',
    'admin@juliecraft.com'
),
(
    (SELECT id FROM products LIMIT 1),
    'Sample Product',
    'decrease',
    25,
    20,
    -5,
    'sale',
    'Sold to customer',
    'INV-2024-001',
    'admin@juliecraft.com'
);

-- Create a view for inventory summary with latest adjustments
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    p.id,
    p.name as product_name,
    p.sku,
    p.stock_quantity as current_quantity,
    p.min_stock_level,
    p.max_stock_level,
    p.reorder_point,
    p.price as unit_price,
    p.cost_price as unit_cost,
    (p.stock_quantity * p.cost_price) as total_value,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'out_of_stock'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
    END as status,
    p.stock_quantity <= p.reorder_point as below_reorder_point,
    p.updated_at as last_updated,
    p.created_at,
    c.name as category_name,
    -- Get latest adjustment info
    ia.adjustment_type as last_adjustment_type,
    ia.quantity_change as last_quantity_change,
    ia.created_at as last_adjustment_date,
    ia.user_name as last_adjusted_by
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN LATERAL (
    SELECT 
        adjustment_type,
        quantity_change,
        created_at,
        user_name
    FROM inventory_adjustments 
    WHERE product_id = p.id 
    ORDER BY created_at DESC 
    LIMIT 1
) ia ON true;

-- Grant permissions on the view
GRANT SELECT ON inventory_summary TO authenticated;
