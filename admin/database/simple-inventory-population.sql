-- Simple Inventory Population
-- Run this to create inventory records for your products

-- First, let's see what products you have
SELECT 
  id,
  name,
  sku,
  stock_quantity,
  price,
  cost_price
FROM products 
LIMIT 5;

-- Create inventory records for all products
INSERT INTO inventory (
  product_id,
  sku,
  product_name,
  current_stock,
  min_stock,
  max_stock,
  reorder_point,
  unit_cost,
  unit_price,
  supplier,
  status
)
SELECT 
  id as product_id,
  COALESCE(sku, 'SKU-' || SUBSTRING(id::text, 1, 8)) as sku,
  name as product_name,
  COALESCE(stock_quantity, 0) as current_stock,
  5 as min_stock,
  100 as max_stock,
  10 as reorder_point,
  cost_price as unit_cost,
  price as unit_price,
  'Default Supplier' as supplier,
  CASE 
    WHEN COALESCE(stock_quantity, 0) = 0 THEN 'out_of_stock'
    WHEN COALESCE(stock_quantity, 0) <= 5 THEN 'low_stock'
    ELSE 'in_stock'
  END as status
FROM products
WHERE NOT EXISTS (
  SELECT 1 FROM inventory 
  WHERE inventory.product_id = products.id
);

-- Check the results
SELECT 
  COUNT(*) as total_inventory_items
FROM inventory;

-- Show your inventory
SELECT 
  product_name,
  sku,
  current_stock,
  status,
  unit_price
FROM inventory
ORDER BY product_name;
