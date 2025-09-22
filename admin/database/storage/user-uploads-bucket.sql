-- Create storage bucket for user uploads (profile photos, etc.)
-- This should be run in your Supabase SQL editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for user-uploads bucket

-- Policy for authenticated users to upload their own files
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for public read access to avatars (since they're in a public folder structure)
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' 
  AND name LIKE 'avatars/%'
);
