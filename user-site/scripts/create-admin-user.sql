-- Script to create the first admin user
-- Run this in your Supabase SQL Editor after creating your first user account

-- Replace 'your-user-email@example.com' with the actual email of the user you want to make admin
-- This user must already be registered through your app's sign-up process

UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-user-email@example.com';

-- Verify the admin user was created
SELECT id, email, first_name, last_name, is_admin, created_at
FROM profiles 
WHERE is_admin = true;
