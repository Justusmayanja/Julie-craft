-- Script to check and create admin user
-- Run this in your Supabase SQL Editor

-- First, let's see all users and their profiles
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created,
  p.first_name,
  p.last_name,
  p.is_admin,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- If you see a user without a profile, create one:
-- Replace 'your-user-email@example.com' with the actual email
INSERT INTO profiles (id, email, first_name, last_name, is_admin)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Admin'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'User'),
  true
FROM auth.users au
WHERE au.email = 'your-user-email@example.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = au.id);

-- If the profile exists but is_admin is false, update it:
-- Replace 'your-user-email@example.com' with the actual email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-user-email@example.com';

-- Verify the admin user:
SELECT id, email, first_name, last_name, is_admin, created_at
FROM profiles 
WHERE is_admin = true;
