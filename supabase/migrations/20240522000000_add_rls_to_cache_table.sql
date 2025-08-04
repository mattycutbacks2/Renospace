-- Enable Row Level Security on the cache table
ALTER TABLE public.generated_images_cache ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow the backend service role to perform all actions
-- This gives our Edge Function the necessary permissions to read from and write to the cache
CREATE POLICY "Enable all access for service_role"
ON public.generated_images_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 