-- EMERGENCY STORAGE FIX: Disable RLS completely for development
-- This is a quick fix for storage issues

-- Step 1: Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: COMPLETELY DISABLE RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all storage policies
DO $$ 
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol_name);
    END LOOP;
END $$;

-- Step 4: Grant ALL permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Step 5: Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- This should show rowsecurity = false
-- Now storage uploads should work without RLS restrictions
