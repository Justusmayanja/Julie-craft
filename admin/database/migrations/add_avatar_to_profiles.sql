-- Add profile fields to profiles table
-- This migration adds support for user profile photos and extended profile information

-- Add avatar_url column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add additional profile fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false, "marketing": true}';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);

-- Update the profiles table to include avatar_url in the RLS policies
-- (This assumes you have RLS enabled on the profiles table)

-- Example RLS policy for profiles (adjust based on your existing policies)
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- CREATE POLICY "Users can view own profile" ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- CREATE POLICY "Users can update own profile" ON profiles
--   FOR UPDATE USING (auth.uid() = id);

-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- CREATE POLICY "Users can insert own profile" ON profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);
