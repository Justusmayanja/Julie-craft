-- Safe RLS setup that handles existing policies
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Drop existing policies safely (ignore if they don't exist)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin_check" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin_all" ON profiles;

-- Now create the safe, non-recursive policies
CREATE POLICY "profiles_select_own" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policies were created
SELECT 'RLS policies created successfully' as status;

-- Show final policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
