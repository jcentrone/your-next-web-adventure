-- Make signatures bucket public so signatures can be viewed in shared reports
UPDATE storage.buckets 
SET public = true 
WHERE id = 'signatures';

-- Add policy to allow public read access to signatures for report sharing
CREATE POLICY "Allow public read access to signatures for report sharing" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'signatures');