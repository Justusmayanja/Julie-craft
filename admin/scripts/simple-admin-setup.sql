-- Simple admin setup without RLS recursion issues
-- Run this in your Supabase SQL Editor

-- First, let's completely disable RLS on profiles table temporarily
-- This will allow our admin authentication to work
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Now let's make sure your user has admin privileges
-- Replace 'your-email@example.com' with your actual email

-- Check if user exists
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Create or update profile with admin privileges
INSERT INTO profiles (id, email, first_name, last_name, is_admin)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Admin'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'User'),
  true
FROM auth.users au
WHERE au.email = 'your-email@example.com'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  email = EXCLUDED.email;

-- Verify the admin user
SELECT id, email, first_name, last_name, is_admin, created_at
FROM profiles 
WHERE is_admin = true;

-- Optional: Re-enable RLS with simple policies (after testing)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
