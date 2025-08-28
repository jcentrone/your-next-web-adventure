-- Make report-media bucket public for logo access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'report-media';