-- Create the 'uploads' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create the 'results' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('results', 'results', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create the generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  prompt TEXT NOT NULL,
  original_url TEXT NOT NULL,
  result_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at);

-- Enable Row Level Security
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create policies for generated_images table
CREATE POLICY "Users can view their own generated images"
ON generated_images FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated images"
ON generated_images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated images"
ON generated_images FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
ON generated_images FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Set up RLS policies for the 'uploads' bucket
-- Policy: Allow public read access
CREATE POLICY "Public Read on uploads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'uploads' );

-- Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated Upload on uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'uploads' );

-- Set up RLS policies for the 'results' bucket
-- Policy: Allow public read access
CREATE POLICY "Public Read on results"
ON storage.objects FOR SELECT
USING ( bucket_id = 'results' );

-- Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated Upload on results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'results' ); 