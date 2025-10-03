-- Populate Inventory from Existing Products
-- This script creates inventory records for all your existing products
-- Run this in your Supabase SQL Editor

-- Step 1: Check what products exist
SELECT 
  'Products in database:' as info,
  COUNT(*) as product_count
FROM products;

-- Step 2: Check what inventory exists
SELECT 
  'Inventory items in database:' as info,
  COUNT(*) as inventory_count
FROM inventory;

-- Step 3: Create inventory records for products that don't have inventory yet
INSERT INTO inventory (
  product_id,
  sku,
  product_name,
  category_name,
  current_stock,
  min_stock,
  max_stock,
  reorder_point,
  unit_cost,
  unit_price,
  supplier,
  status,
  movement_trend,
  notes
)
SELECT 
  p.id as product_id,
  COALESCE(p.sku, 'SKU-' || SUBSTRING(p.id::text, 1, 8)) as sku,
  p.name as product_name,
  c.name as category_name,
  COALESCE(p.stock_quantity, 0) as current_stock,
  COALESCE(p.min_stock_level, 5) as min_stock,
  COALESCE(p.max_stock_level, 100) as max_stock,
  COALESCE(p.reorder_point, 10) as reorder_point,
  p.cost_price as unit_cost,
  p.price as unit_price,
  'Default Supplier' as supplier,
  CASE 
    WHEN COALESCE(p.stock_quantity, 0) = 0 THEN 'out_of_stock'
    WHEN COALESCE(p.stock_quantity, 0) <= COALESCE(p.min_stock_level, 5) THEN 'low_stock'
    ELSE 'in_stock'
  END as status,
  'stable' as movement_trend,
  'Auto-created from product' as notes
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i 
  WHERE i.product_id = p.id
);

-- Step 4: Update inventory records for products that already have inventory
UPDATE inventory 
SET 
  product_name = p.name,
  category_name = c.name,
  current_stock = COALESCE(p.stock_quantity, inventory.current_stock),
  min_stock = COALESCE(p.min_stock_level, inventory.min_stock),
  max_stock = COALESCE(p.max_stock_level, inventory.max_stock),
  reorder_point = COALESCE(p.reorder_point, inventory.reorder_point),
  unit_cost = COALESCE(p.cost_price, inventory.unit_cost),
  unit_price = COALESCE(p.price, inventory.unit_price),
  status = CASE 
    WHEN COALESCE(p.stock_quantity, inventory.current_stock) = 0 THEN 'out_of_stock'
    WHEN COALESCE(p.stock_quantity, inventory.current_stock) <= COALESCE(p.min_stock_level, inventory.min_stock) THEN 'low_stock'
    ELSE 'in_stock'
  END,
  updated_at = NOW()
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE inventory.product_id = p.id;

-- Step 5: Verify the results
SELECT 
  'After population:' as info,
  COUNT(*) as inventory_count
FROM inventory;

-- Step 6: Show sample inventory data
SELECT 
  i.id,
  i.product_name,
  i.sku,
  i.category_name,
  i.current_stock,
  i.min_stock,
  i.max_stock,
  i.status,
  i.unit_cost,
  i.unit_price,
  i.total_value
FROM inventory i
ORDER BY i.product_name
LIMIT 10;

-- Step 7: Show products without inventory (if any)
SELECT 
  'Products without inventory:' as info,
  COUNT(*) as count
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i 
  WHERE i.product_id = p.id
);

-- If there are products without inventory, show them
SELECT 
  p.id,
  p.name,
  p.sku,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i 
  WHERE i.product_id = p.id
)
LIMIT 5;
