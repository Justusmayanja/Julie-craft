-- Simple Storage Fix (Minimal approach)
-- This should work with standard Supabase permissions

-- Step 1: Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO UPDATE SET 
    public = true;

-- Step 2: Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

-- Step 3: Create simple, permissive policies
CREATE POLICY "Allow authenticated upload" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Allow authenticated read" ON storage.objects
    FOR SELECT 
    TO authenticated
    USING (bucket_id = 'user-uploads');

CREATE POLICY "Allow authenticated update" ON storage.objects
    FOR UPDATE 
    TO authenticated
    USING (bucket_id = 'user-uploads')
    WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Allow authenticated delete" ON storage.objects
    FOR DELETE 
    TO authenticated
    USING (bucket_id = 'user-uploads');

-- Step 4: Check bucket status
SELECT 
    id, 
    name, 
    public,
    created_at
FROM storage.buckets 
WHERE id = 'user-uploads';
