-- supabase/migrations/20240521120000_create_cache_table.sql

CREATE TABLE IF NOT EXISTS generated_images_cache (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  request_hash TEXT UNIQUE NOT NULL,
  tool TEXT NOT NULL,
  request_body JSONB NOT NULL,
  result_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Create an index for faster lookups on the hash
CREATE INDEX IF NOT EXISTS idx_request_hash ON generated_images_cache(request_hash); 