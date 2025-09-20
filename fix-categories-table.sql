-- ============================================================================
-- FIX CATEGORIES TABLE - Add missing columns for existing database
-- ============================================================================
-- Run this script if you're getting "column is_active does not exist" errors
-- This adds the missing columns to existing tables
-- ============================================================================

-- Add missing columns to categories table if they don't exist
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE categories ADD COLUMN slug VARCHAR(100) UNIQUE;
    END IF;
    
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
    -- Add short_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'short_description') THEN
        ALTER TABLE products ADD COLUMN short_description VARCHAR(500);
    END IF;
    
    -- Add sale_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'sale_price') THEN
        ALTER TABLE products ADD COLUMN sale_price DECIMAL(12,0) CHECK (sale_price >= 0);
    END IF;
    
    -- Add gallery_urls column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'gallery_urls') THEN
        ALTER TABLE products ADD COLUMN gallery_urls TEXT[];
    END IF;
    
    -- Add low_stock_threshold column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
        ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
    END IF;
    
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku VARCHAR(100) UNIQUE;
    END IF;
    
    -- Add weight column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'weight') THEN
        ALTER TABLE products ADD COLUMN weight DECIMAL(8,2);
    END IF;
    
    -- Add dimensions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'dimensions') THEN
        ALTER TABLE products ADD COLUMN dimensions JSONB;
    END IF;
    
    -- Add meta_title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'meta_title') THEN
        ALTER TABLE products ADD COLUMN meta_title VARCHAR(200);
    END IF;
    
    -- Add meta_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'meta_description') THEN
        ALTER TABLE products ADD COLUMN meta_description TEXT;
    END IF;
    
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE products ADD COLUMN slug VARCHAR(200) UNIQUE;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
    END IF;
    
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(20);
    END IF;
    
    -- Add is_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
        ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
        ALTER TABLE profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update existing data to set default values
UPDATE categories SET is_active = TRUE WHERE is_active IS NULL;
UPDATE categories SET sort_order = 0 WHERE sort_order IS NULL;
UPDATE products SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL;
UPDATE profiles SET is_verified = FALSE WHERE is_verified IS NULL;
UPDATE profiles SET preferences = '{}' WHERE preferences IS NULL;

-- Generate slugs for existing categories if they don't have them
UPDATE categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
WHERE slug IS NULL OR slug = '';

-- Generate slugs for existing products if they don't have them
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
WHERE slug IS NULL OR slug = '';

-- Generate SKUs for existing products if they don't have them
UPDATE products 
SET sku = 'SKU-' || SUBSTRING(id::text, 1, 8)::text
WHERE sku IS NULL OR sku = '';

COMMENT ON TABLE categories IS 'Categories table with all required columns for the enhanced schema';
COMMENT ON TABLE products IS 'Products table with all required columns for the enhanced schema';
COMMENT ON TABLE profiles IS 'Profiles table with all required columns for the enhanced schema';
