-- PRODUCTION RLS FIX: Non-recursive policies
-- This script creates RLS policies that don't reference the profiles table

-- Step 1: Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DO $$ 
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol_name);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- These policies only reference auth.uid() and don't query the profiles table

-- Allow users to select their own profile
CREATE POLICY "simple_select_policy" ON profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "simple_insert_policy" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "simple_update_policy" ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow users to delete their own profile
CREATE POLICY "simple_delete_policy" ON profiles
    FOR DELETE
    TO authenticated
    USING (id = auth.uid());

-- Step 5: Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Verify policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
