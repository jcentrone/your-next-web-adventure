-- Ensure signatures bucket is public for report sharing
UPDATE storage.buckets 
SET public = true 
WHERE id = 'signatures';

-- Grant public read access to signatures bucket
DROP POLICY IF EXISTS "Allow public read access to signatures for report sharing" ON storage.objects;
CREATE POLICY "Allow public read access to signatures for report sharing" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'signatures');