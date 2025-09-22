-- Temporary fix: Disable RLS for testing
-- Use this if the recursion issue persists

-- Disable RLS temporarily for profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Note: This is a temporary solution for development
-- In production, you should use proper RLS policies
-- Run this to re-enable RLS later: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
