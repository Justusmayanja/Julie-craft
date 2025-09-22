-- Supabase Storage Fix (No direct table modifications)
-- This approach works within Supabase's permission structure

-- Step 1: Create the user-uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing storage policies (this should work)
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

-- Step 3: Create new storage policies for user-uploads bucket
CREATE POLICY "public_upload_policy" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "public_select_policy" ON storage.objects
    FOR SELECT 
    TO authenticated
    USING (bucket_id = 'user-uploads');

CREATE POLICY "public_update_policy" ON storage.objects
    FOR UPDATE 
    TO authenticated
    USING (bucket_id = 'user-uploads')
    WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "public_delete_policy" ON storage.objects
    FOR DELETE 
    TO authenticated
    USING (bucket_id = 'user-uploads');

-- Step 4: Verify the bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'user-uploads';

-- Step 5: Verify policies were created
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
