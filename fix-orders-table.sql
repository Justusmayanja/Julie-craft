-- ============================================================================
-- FIX ORDERS TABLE - Add missing order_number column
-- ============================================================================
-- Run this script if you're getting "column order_number does not exist" errors
-- This adds the missing order_number column and other enhancements
-- ============================================================================

-- Add missing columns to orders table if they don't exist
DO $$ 
BEGIN
    -- Add order_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) UNIQUE;
    END IF;
    
    -- Add subtotal column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(12,0) DEFAULT 0 CHECK (subtotal >= 0);
    END IF;
    
    -- Add tax_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'tax_amount') THEN
        ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(12,0) DEFAULT 0 CHECK (tax_amount >= 0);
    END IF;
    
    -- Add shipping_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_amount') THEN
        ALTER TABLE orders ADD COLUMN shipping_amount DECIMAL(12,0) DEFAULT 0 CHECK (shipping_amount >= 0);
    END IF;
    
    -- Add discount_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
        ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(12,0) DEFAULT 0 CHECK (discount_amount >= 0);
    END IF;
    
    -- Add payment_reference column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'payment_reference') THEN
        ALTER TABLE orders ADD COLUMN payment_reference TEXT;
    END IF;
    
    -- Add shipping_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(100);
    END IF;
    
    -- Add tracking_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE orders ADD COLUMN tracking_number TEXT;
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'metadata') THEN
        ALTER TABLE orders ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Generate order numbers for existing orders if they don't have them
-- Using a CTE to generate sequential numbers
WITH numbered_orders AS (
  SELECT id, 
         'ORD-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 4, '0') as new_order_number
  FROM orders 
  WHERE order_number IS NULL OR order_number = ''
)
UPDATE orders 
SET order_number = numbered_orders.new_order_number
FROM numbered_orders
WHERE orders.id = numbered_orders.id;

-- Set default values for orders
UPDATE orders SET subtotal = total_amount WHERE subtotal IS NULL OR subtotal = 0;
UPDATE orders SET tax_amount = 0 WHERE tax_amount IS NULL;
UPDATE orders SET shipping_amount = 0 WHERE shipping_amount IS NULL;
UPDATE orders SET discount_amount = 0 WHERE discount_amount IS NULL;
UPDATE orders SET metadata = '{}' WHERE metadata IS NULL;

-- Update constraints to allow new status values
DO $$ 
BEGIN
    -- Update status constraint to include 'refunded'
    BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
            CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- Update payment_status constraint to include 'partially_refunded'
    BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
        ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
            CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded'));
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

COMMENT ON TABLE orders IS 'Orders table with all required columns for the enhanced schema';
