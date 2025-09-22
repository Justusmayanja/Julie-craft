-- Storage RLS Fix for User Uploads
-- This script fixes RLS policies for the storage bucket

-- Step 1: Check if the user-uploads bucket exists
SELECT * FROM storage.buckets WHERE id = 'user-uploads';

-- Step 2: Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Disable RLS on storage.objects temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing storage policies
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

-- Step 5: Grant permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Step 6: Re-enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 7: Create simple storage policies
CREATE POLICY "allow_authenticated_upload" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "allow_authenticated_read" ON storage.objects
    FOR SELECT 
    TO authenticated
    USING (bucket_id = 'user-uploads');

CREATE POLICY "allow_authenticated_update" ON storage.objects
    FOR UPDATE 
    TO authenticated
    USING (bucket_id = 'user-uploads')
    WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "allow_authenticated_delete" ON storage.objects
    FOR DELETE 
    TO authenticated
    USING (bucket_id = 'user-uploads');

-- Step 8: Create a function to set owner on upload
CREATE OR REPLACE FUNCTION public.handle_new_upload()
RETURNS TRIGGER AS $$
BEGIN
    NEW.owner := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger to set owner on upload
DROP TRIGGER IF EXISTS on_user_upload_set_owner ON storage.objects;
CREATE TRIGGER on_user_upload_set_owner
    BEFORE INSERT ON storage.objects
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_upload();

-- Step 10: Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
