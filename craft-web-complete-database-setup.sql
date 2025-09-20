-- ============================================================================
-- CRAFT WEB - COMPLETE DATABASE SETUP SCRIPT FOR SUPABASE
-- ============================================================================
-- This script creates all necessary tables, security policies, and features
-- for the Craft Web e-commerce platform with admin dashboard.
-- 
-- CURRENCY: All prices are in UGX (Ugandan Shilling) - no decimal places
-- COUNTRY: Default country set to Uganda (UG)
-- 
-- Run this script in your Supabase SQL Editor to set up your database.
-- ============================================================================

-- ============================================================================
-- 1. CORE E-COMMERCE TABLES
-- ============================================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to categories table if they don't exist
DO $$ 
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE categories ADD COLUMN slug VARCHAR(100) UNIQUE;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12,0) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to products table if they don't exist
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

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'UG',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to profiles table if they don't exist
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

-- Create addresses table for multiple shipping addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing', 'both')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'UG',
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(12,0) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'credit_card',
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to orders table if they don't exist
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
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(12,0) NOT NULL DEFAULT 0 CHECK (subtotal >= 0);
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

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(12,0) NOT NULL CHECK (price >= 0),
  total_price DECIMAL(12,0) GENERATED ALWAYS AS (quantity * price) STORED,
  product_snapshot JSONB, -- Store product details at time of order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CONTENT MANAGEMENT TABLES
-- ============================================================================

-- Create pages table for CMS functionality
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  meta_title VARCHAR(200),
  meta_description TEXT,
  featured_image TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  template VARCHAR(50) DEFAULT 'default',
  sort_order INTEGER DEFAULT 0,
  is_homepage BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  meta_title VARCHAR(200),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media library table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  folder VARCHAR(100) DEFAULT 'uploads',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. ANALYTICS AND REPORTING TABLES
-- ============================================================================

-- Create analytics events table for tracking user behavior
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product views table for tracking product popularity
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 4. MARKETING AND PROMOTIONS
-- ============================================================================

-- Create coupons/discounts table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed_amount')),
  value DECIMAL(12,0) NOT NULL CHECK (value >= 0),
  minimum_amount DECIMAL(12,0) DEFAULT 0,
  maximum_discount DECIMAL(12,0),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. INVENTORY AND STOCK MANAGEMENT
-- ============================================================================

-- Create stock movements table for inventory tracking
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'return')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_type VARCHAR(50), -- 'order', 'manual', 'return', etc.
  reference_id UUID,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. REVIEWS AND RATINGS
-- ============================================================================

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_select_admin" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
DROP POLICY IF EXISTS "order_items_update_own" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_own" ON order_items;

DROP POLICY IF EXISTS "pages_select_published" ON pages;
DROP POLICY IF EXISTS "pages_select_admin" ON pages;
DROP POLICY IF EXISTS "pages_insert_admin" ON pages;
DROP POLICY IF EXISTS "pages_update_admin" ON pages;
DROP POLICY IF EXISTS "pages_delete_admin" ON pages;

DROP POLICY IF EXISTS "blog_posts_select_published" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_select_admin" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_admin" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_admin" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_admin" ON blog_posts;

DROP POLICY IF EXISTS "media_select_public" ON media;
DROP POLICY IF EXISTS "media_select_admin" ON media;
DROP POLICY IF EXISTS "media_insert_admin" ON media;
DROP POLICY IF EXISTS "media_update_admin" ON media;
DROP POLICY IF EXISTS "media_delete_admin" ON media;

DROP POLICY IF EXISTS "wishlists_select_own" ON wishlists;
DROP POLICY IF EXISTS "wishlists_insert_own" ON wishlists;
DROP POLICY IF EXISTS "wishlists_delete_own" ON wishlists;

DROP POLICY IF EXISTS "product_reviews_select_approved" ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_select_admin" ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_insert_own" ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_update_admin" ON product_reviews;

DROP POLICY IF EXISTS "analytics_events_insert_authenticated" ON analytics_events;
DROP POLICY IF EXISTS "analytics_events_select_admin" ON analytics_events;

DROP POLICY IF EXISTS "product_views_insert_authenticated" ON product_views;
DROP POLICY IF EXISTS "product_views_select_admin" ON product_views;

DROP POLICY IF EXISTS "coupons_select_active" ON coupons;
DROP POLICY IF EXISTS "coupons_select_admin" ON coupons;
DROP POLICY IF EXISTS "coupons_insert_admin" ON coupons;
DROP POLICY IF EXISTS "coupons_update_admin" ON coupons;

DROP POLICY IF EXISTS "newsletter_subscribers_insert_public" ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_select_admin" ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_update_admin" ON newsletter_subscribers;

DROP POLICY IF EXISTS "stock_movements_select_admin" ON stock_movements;
DROP POLICY IF EXISTS "stock_movements_insert_admin" ON stock_movements;

-- Categories policies (public read, admin write)
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Products policies (public read, admin write)
CREATE POLICY "products_select_all" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "products_select_admin" ON products FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Profiles policies (users can manage their own profile, admins can see all)
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Addresses policies (users can manage their own addresses)
CREATE POLICY "addresses_select_own" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert_own" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update_own" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_delete_own" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Orders policies (users can manage their own orders, admins can see all)
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON orders FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Order items policies (users can manage their own order items, admins can see all)
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "order_items_update_own" ON order_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Pages policies (public read for published, admin write)
CREATE POLICY "pages_select_published" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "pages_select_admin" ON pages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "pages_insert_admin" ON pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "pages_update_admin" ON pages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "pages_delete_admin" ON pages FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Blog posts policies (public read for published, admin write)
CREATE POLICY "blog_posts_select_published" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_posts_select_admin" ON blog_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "blog_posts_insert_admin" ON blog_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "blog_posts_update_admin" ON blog_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "blog_posts_delete_admin" ON blog_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Media policies (public read for public media, admin write)
CREATE POLICY "media_select_public" ON media FOR SELECT USING (is_public = true);
CREATE POLICY "media_select_admin" ON media FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "media_insert_admin" ON media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "media_update_admin" ON media FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "media_delete_admin" ON media FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Wishlist policies (users can manage their own wishlist)
CREATE POLICY "wishlists_select_own" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlists_insert_own" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlists_delete_own" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Product reviews policies (public read for approved, users can write their own)
CREATE POLICY "product_reviews_select_approved" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "product_reviews_select_admin" ON product_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "product_reviews_insert_own" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "product_reviews_update_admin" ON product_reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Analytics events policies (authenticated users can insert, admins can read all)
CREATE POLICY "analytics_events_insert_authenticated" ON analytics_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "analytics_events_select_admin" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Product views policies (authenticated users can insert, admins can read all)
CREATE POLICY "product_views_insert_authenticated" ON product_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "product_views_select_admin" ON product_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Coupons policies (public read for active, admin write)
CREATE POLICY "coupons_select_active" ON coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "coupons_select_admin" ON coupons FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "coupons_insert_admin" ON coupons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "coupons_update_admin" ON coupons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Newsletter subscribers policies (public insert, admin read/write)
CREATE POLICY "newsletter_subscribers_insert_public" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_subscribers_select_admin" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "newsletter_subscribers_update_admin" ON newsletter_subscribers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Stock movements policies (admin only)
CREATE POLICY "stock_movements_select_admin" ON stock_movements FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "stock_movements_insert_admin" ON stock_movements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Address indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON addresses(type);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_is_homepage ON pages(is_homepage);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON media(is_public);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Coupon indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON newsletter_subscribers(is_active);

-- Stock movement indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);

-- ============================================================================
-- 10. TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Function to update stock quantity
CREATE OR REPLACE FUNCTION public.update_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update product stock when order item is created
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Log stock movement
    INSERT INTO stock_movements (product_id, movement_type, quantity, reason, reference_type, reference_id)
    VALUES (NEW.product_id, 'out', NEW.quantity, 'Order placed', 'order', NEW.order_id);
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order number generation trigger
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- Stock update trigger
CREATE TRIGGER update_stock_on_order_trigger
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_on_order();

-- ============================================================================
-- 11. SAMPLE DATA
-- ============================================================================

-- Set default values for existing data
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

-- Insert sample categories
INSERT INTO categories (name, description, image_url, slug, sort_order) VALUES
('Pottery', 'Handcrafted ceramic pieces including bowls, vases, and decorative items', '/placeholder.svg?height=300&width=300', 'pottery', 1),
('Jewelry', 'Unique handmade jewelry pieces including necklaces, bracelets, and earrings', '/placeholder.svg?height=300&width=300', 'jewelry', 2),
('Textiles', 'Woven and knitted items including scarves, blankets, and clothing', '/placeholder.svg?height=300&width=300', 'textiles', 3),
('Woodwork', 'Carved and crafted wooden items including furniture and decorative pieces', '/placeholder.svg?height=300&width=300', 'woodwork', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products (prices in UGX - Ugandan Shilling) only if they don't exist
INSERT INTO products (name, description, short_description, price, category_id, image_url, stock_quantity, is_featured, sku, slug)
SELECT * FROM (VALUES
-- Pottery products
('Ceramic Bowl Set', 'Set of 4 handcrafted ceramic bowls in earth tones. Each bowl is unique with subtle variations in glaze and shape, making them perfect for everyday use or special occasions.', 'Set of 4 handcrafted ceramic bowls in earth tones', 350000, (SELECT id FROM categories WHERE name = 'Pottery'), '/placeholder.svg?height=400&width=400', 12, true, 'CB-001', 'ceramic-bowl-set'),
('Blue Glazed Vase', 'Large decorative vase with beautiful blue glaze finish. Perfect centerpiece for any room, featuring a unique hand-thrown shape and stunning glaze pattern.', 'Large decorative vase with beautiful blue glaze finish', 480000, (SELECT id FROM categories WHERE name = 'Pottery'), '/placeholder.svg?height=400&width=400', 8, false, 'BG-001', 'blue-glazed-vase'),
('Terracotta Planter', 'Rustic terracotta planter perfect for herbs and small plants. Made from natural clay with excellent drainage and breathability.', 'Rustic terracotta planter perfect for herbs and small plants', 135000, (SELECT id FROM categories WHERE name = 'Pottery'), '/placeholder.svg?height=400&width=400', 15, false, 'TP-001', 'terracotta-planter'),

-- Jewelry products
('Silver Wire Bracelet', 'Elegant handwoven silver wire bracelet with natural stones. Each piece is carefully crafted with attention to detail and comfort.', 'Elegant handwoven silver wire bracelet with natural stones', 265000, (SELECT id FROM categories WHERE name = 'Jewelry'), '/placeholder.svg?height=400&width=400', 20, true, 'SW-001', 'silver-wire-bracelet'),
('Beaded Necklace', 'Colorful beaded necklace with semi-precious stones. Hand-strung with care, featuring a mix of natural stones and glass beads.', 'Colorful beaded necklace with semi-precious stones', 180000, (SELECT id FROM categories WHERE name = 'Jewelry'), '/placeholder.svg?height=400&width=400', 18, false, 'BN-001', 'beaded-necklace'),
('Copper Earrings', 'Handforged copper earrings with unique patina finish. Lightweight and hypoallergenic, perfect for everyday wear.', 'Handforged copper earrings with unique patina finish', 115000, (SELECT id FROM categories WHERE name = 'Jewelry'), '/placeholder.svg?height=400&width=400', 25, true, 'CE-001', 'copper-earrings'),

-- Textiles products
('Wool Throw Blanket', 'Soft wool throw blanket in traditional patterns. Hand-woven with natural wool, providing warmth and comfort.', 'Soft wool throw blanket in traditional patterns', 610000, (SELECT id FROM categories WHERE name = 'Textiles'), '/placeholder.svg?height=400&width=400', 6, true, 'WT-001', 'wool-throw-blanket'),
('Silk Scarf', 'Hand-dyed silk scarf with abstract patterns. Luxurious silk with vibrant colors and unique patterns in each piece.', 'Hand-dyed silk scarf with abstract patterns', 305000, (SELECT id FROM categories WHERE name = 'Textiles'), '/placeholder.svg?height=400&width=400', 14, false, 'SS-001', 'silk-scarf'),

-- Woodwork products
('Carved Wooden Bowl', 'Beautiful hand-carved wooden serving bowl. Made from sustainably sourced wood with natural finish.', 'Beautiful hand-carved wooden serving bowl', 360000, (SELECT id FROM categories WHERE name = 'Woodwork'), '/placeholder.svg?height=400&width=400', 10, false, 'CW-001', 'carved-wooden-bowl'),
('Oak Cutting Board', 'Premium oak cutting board with natural edge. Food-safe finish and durable construction for years of use.', 'Premium oak cutting board with natural edge', 270000, (SELECT id FROM categories WHERE name = 'Woodwork'), '/placeholder.svg?height=400&width=400', 16, true, 'OC-001', 'oak-cutting-board')
) AS sample_products(name, description, short_description, price, category_id, image_url, stock_quantity, is_featured, sku, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE slug = sample_products.slug
);

-- Insert sample pages
INSERT INTO pages (title, slug, content, excerpt, status, template, is_homepage)
SELECT * FROM (VALUES
('Welcome to Craft Web', 'homepage', '<h1>Welcome to Craft Web</h1><p>Discover unique handmade crafts from talented artisans around the world.</p>', 'Discover unique handmade crafts from talented artisans', 'published', 'homepage', true),
('About Us', 'about', '<h1>About Craft Web</h1><p>We are passionate about supporting local artisans and bringing their beautiful creations to you.</p>', 'Learn about our mission and values', 'published', 'default', false),
('Contact Us', 'contact', '<h1>Contact Us</h1><p>Get in touch with us for any questions or support.</p>', 'Get in touch with us', 'published', 'default', false)
) AS sample_pages(title, slug, content, excerpt, status, template, is_homepage)
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = sample_pages.slug
);

-- ============================================================================
-- 12. STORAGE BUCKETS SETUP (Optional - run if you want to set up file storage)
-- ============================================================================

-- Create storage buckets for file uploads
-- Note: These commands need to be run in the Supabase dashboard or via API
-- Uncomment and run if you want to set up file storage buckets

/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('media-library', 'media-library', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Only admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Storage policies for media library
CREATE POLICY "Media library is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'media-library');
CREATE POLICY "Only admins can upload to media library" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media-library' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Storage policies for user avatars
CREATE POLICY "User avatars are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- ============================================================================
-- SCRIPT COMPLETED SUCCESSFULLY!
-- ============================================================================
-- 
-- Your Craft Web database is now fully set up with:
-- ✅ Core e-commerce tables (categories, products, orders, etc.)
-- ✅ Content management system (pages, blog posts, media)
-- ✅ Analytics and tracking capabilities
-- ✅ Marketing features (coupons, newsletter)
-- ✅ Inventory management
-- ✅ Review system
-- ✅ Row Level Security policies
-- ✅ Performance indexes
-- ✅ Automated triggers and functions
-- ✅ Sample data
--
-- Next steps:
-- 1. Create your admin user by signing up and updating the is_admin field
-- 2. Set up your environment variables in your Next.js apps
-- 3. Test the connection with your applications
-- 4. Optional: Set up storage buckets for file uploads
--
-- ============================================================================
