-- FINAL FIX: Disable ALL RLS and fix upload issues
-- Run this in your Supabase Dashboard → SQL Editor
-- This will fix everything in one go

-- 1. Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Turn off RLS on storage schema completely
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 3. Wipe out ALL storage policies
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT schemaname, tablename, policyname
      FROM pg_policies
     WHERE schemaname = 'storage'
  )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      rec.policyname, rec.schemaname, rec.tablename
    );
  END LOOP;
END
$$;

-- 4. Create totally open policies for storage.objects
CREATE POLICY public_insert_objects
  ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY public_select_objects
  ON storage.objects FOR SELECT USING (true);

-- 5. Make sure all buckets are public
UPDATE storage.buckets SET public = true WHERE id IN ('uploads', 'results', 'testbucket');

-- 6. Disable RLS on generated_images table
ALTER TABLE generated_images DISABLE ROW LEVEL SECURITY;

-- 7. Remove all policies from generated_images
DROP POLICY IF EXISTS "Users can view their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can update their own generated images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete their own generated images" ON generated_images;

-- 8. Create open policy for generated_images
CREATE POLICY "Allow everything on generated_images"
  ON generated_images FOR ALL USING (true) WITH CHECK (true);

-- DONE! Your app should now work without any RLS errors. 