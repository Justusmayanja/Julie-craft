-- Minimal fix for inventory system
-- Run this in your Supabase SQL Editor

-- First, check if inventory table exists and create it if needed
DO $$
BEGIN
    -- Create inventory table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory') THEN
        CREATE TABLE inventory (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID,
            sku TEXT UNIQUE,
            product_name TEXT NOT NULL,
            category_name TEXT,
            current_stock INTEGER DEFAULT 0,
            min_stock INTEGER DEFAULT 5,
            max_stock INTEGER DEFAULT 100,
            reorder_point INTEGER DEFAULT 10,
            unit_cost DECIMAL(10,2),
            unit_price DECIMAL(10,2),
            total_value DECIMAL(12,2) GENERATED ALWAYS AS (current_stock * unit_cost) STORED,
            last_restocked TIMESTAMP WITH TIME ZONE,
            supplier TEXT,
            status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
            movement_trend TEXT DEFAULT 'stable' CHECK (movement_trend IN ('increasing', 'decreasing', 'stable')),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Create stock_movements table with foreign key to inventory
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
        CREATE TABLE stock_movements (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
            product_name TEXT NOT NULL,
            sku TEXT NOT NULL,
            movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
            quantity INTEGER NOT NULL,
            previous_stock INTEGER NOT NULL,
            new_stock INTEGER NOT NULL,
            reason TEXT NOT NULL,
            reference TEXT,
            notes TEXT,
            created_by TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_id ON stock_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Admins can manage inventory') THEN
        CREATE POLICY "Admins can manage inventory" ON inventory
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.is_admin = true
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'Admins can manage stock movements') THEN
        CREATE POLICY "Admins can manage stock movements" ON stock_movements
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.is_admin = true
                )
            );
    END IF;
END $$;
