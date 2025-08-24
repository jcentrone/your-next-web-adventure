-- 1) Create private bucket for user-uploaded images
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'image-library') THEN
    PERFORM storage.create_bucket(
      id     => 'image-library',
      name   => 'image-library',
      public => false
    );
  END IF;
END
$$;

-- 2) Restrict access so users can only manage files in their own folder
CREATE POLICY "Users can upload image library files to their folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'image-library'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can read their own image library files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'image-library'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can update their own image library files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'image-library'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'image-library'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can delete their own image library files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'image-library'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
