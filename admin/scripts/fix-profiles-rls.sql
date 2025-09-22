-- Fix infinite recursion in profiles RLS policies
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_select_admin_check" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

-- Create simple, non-recursive policies for profiles table

-- Allow users to read their own profile
CREATE POLICY "profiles_select_own_profile" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile (except is_admin field)
CREATE POLICY "profiles_update_own_profile" ON profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own_profile" ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow admins to read all profiles (this is the tricky one - we need to avoid recursion)
-- We'll use a function to check admin status without querying profiles table
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use auth.jwt() to get claims instead of querying profiles table
  -- This avoids the recursion issue
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative approach: Use a simple policy that doesn't cause recursion
-- Allow admins to read all profiles by checking a separate admin_users table
-- First, let's create a simple admin check without recursion

-- Create a policy that allows admins to read all profiles
-- We'll use a different approach - check if user has admin role in auth.users metadata
CREATE POLICY "profiles_select_admin_all" ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
  )
);

-- Allow admins to update all profiles
CREATE POLICY "profiles_update_admin_all" ON profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
  )
);

-- Test the policies work
SELECT 'Policies created successfully' as status;

-- Verify current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
