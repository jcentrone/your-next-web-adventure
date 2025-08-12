-- Ensure bucket exists (safe if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'report-media') THEN
    PERFORM storage.create_bucket(
      id => 'report-media',
      name => 'report-media',
      public => false
    );
  END IF;
END
$$;

-- Recreate policies idempotently
DROP POLICY IF EXISTS "Users can upload report media to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own report media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own report media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own report media" ON storage.objects;

-- Allow authenticated users to upload to their own folder prefix (user_id/...)
CREATE POLICY "Users can upload report media to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-media'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own report media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-media'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own report media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'report-media'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'report-media'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own report media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-media'
  AND split_part(name, '/', 1) = auth.uid()::text
);
