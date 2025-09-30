-- Fix storage policies to avoid RLS recursion
-- This script creates simple storage policies that don't reference the profiles table

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage business files" ON storage.objects;

-- Create simple storage policies for authenticated users
CREATE POLICY "Authenticated users can manage product images" ON storage.objects
FOR ALL USING (
  bucket_id = 'products' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can manage media files" ON storage.objects
FOR ALL USING (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can manage business files" ON storage.objects
FOR ALL USING (
  bucket_id = 'business' AND
  auth.role() = 'authenticated'
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
