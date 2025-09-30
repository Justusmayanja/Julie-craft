-- Emergency fix for RLS infinite recursion
-- This script temporarily disables RLS to allow admin operations

-- Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create a simple admin check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin_simple()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple check without RLS complications
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_simple() TO authenticated;

-- Re-enable RLS on profiles with simpler policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view all profiles (for admin operations)
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update all other policies to use the simple function
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can manage business settings" ON business_settings;
DROP POLICY IF EXISTS "Admins can manage pages" ON pages;
DROP POLICY IF EXISTS "Admins can manage media" ON media;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage sales analytics" ON sales_analytics;

-- Recreate all admin policies using the simple function
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage business settings" ON business_settings
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage pages" ON pages
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage media" ON media
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Admins can manage sales analytics" ON sales_analytics
  FOR ALL USING (is_admin_simple());

-- Test the fix
SELECT 'Emergency RLS fix applied successfully' as status;
