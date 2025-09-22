-- Comprehensive RLS Fix for Profiles Table
-- This script completely rebuilds the RLS policies to fix all issues

-- Step 1: Completely disable RLS and clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (comprehensive cleanup)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_rls_select" ON profiles;
DROP POLICY IF EXISTS "profiles_rls_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_rls_update" ON profiles;
DROP POLICY IF EXISTS "profiles_rls_delete" ON profiles;

-- Step 3: Grant all permissions to authenticated role
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple, working policies
CREATE POLICY "allow_select_own_profile" ON profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "allow_insert_own_profile" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_profile" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_delete_own_profile" ON profiles
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- Step 6: Verify the policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 7: Test with a simple query (this should work now)
-- SELECT * FROM profiles WHERE id = auth.uid();