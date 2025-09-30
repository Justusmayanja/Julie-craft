-- Fix infinite recursion in profiles RLS policies
-- The issue is that the "Admins can view all profiles" policy queries the profiles table
-- which causes infinite recursion when RLS is enabled

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simpler admin policy that doesn't query the profiles table
-- Instead, we'll use a function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user is an admin by looking at their profile
  -- This function bypasses RLS by using SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Create a new admin policy that uses the function
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Also update other policies to use the function for consistency
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

-- Recreate all admin policies using the function
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage business settings" ON business_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage pages" ON pages
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage media" ON media
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage sales analytics" ON sales_analytics
  FOR ALL USING (is_admin());

-- Verify the fix
SELECT 'RLS policies updated successfully' as status;
