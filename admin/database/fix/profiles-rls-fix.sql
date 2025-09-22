-- Fix infinite recursion in profiles RLS policies
-- Run this to fix the recursion issue

-- First, disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Policy for SELECT - users can view their own profile
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Policy for INSERT - users can insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for UPDATE - users can update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for DELETE - users can delete their own profile
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- Ensure proper permissions are granted
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
