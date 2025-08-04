-- Fix storage policies to allow uploads
-- Run this in your Supabase Dashboard → SQL Editor

-- 1. Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Public Read on uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload on uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on uploads bucket" ON storage.objects;

-- 3. Create open policies for uploads bucket
CREATE POLICY "Allow public read on uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Allow public insert on uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public update on uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- 4. Disable RLS on generated_images table
ALTER TABLE generated_images DISABLE ROW LEVEL SECURITY;

-- 5. Remove all policies from generated_images
DROP POLICY IF EXISTS "Users can view their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can update their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete their own generated images" ON generated_images;

-- 6. Create open policy for generated_images
CREATE POLICY "Allow everything on generated_images"
ON generated_images FOR ALL USING (true) WITH CHECK (true);

-- DONE! Your app should now work without RLS errors. 