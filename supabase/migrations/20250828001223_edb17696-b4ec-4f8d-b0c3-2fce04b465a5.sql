-- Make report-media bucket public for logo access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'report-media';

-- Create storage policies for logo uploads
CREATE POLICY "Organization owners can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND EXISTS (
    SELECT 1 FROM organization_members m
    JOIN organizations o ON o.id = m.organization_id
    WHERE m.user_id = auth.uid() 
    AND m.role IN ('owner', 'admin')
    AND (storage.foldername(name))[2] = o.id::text || '-logo.jpg'
    OR (storage.foldername(name))[2] = o.id::text || '-logo.png'
    OR (storage.foldername(name))[2] = o.id::text || '-logo.jpeg'
  )
);

-- Create policy for logo updates
CREATE POLICY "Organization owners can update logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND EXISTS (
    SELECT 1 FROM organization_members m
    JOIN organizations o ON o.id = m.organization_id
    WHERE m.user_id = auth.uid() 
    AND m.role IN ('owner', 'admin')
  )
);

-- Create policy for logo access (public read for logos)
CREATE POLICY "Logos are publicly readable" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
);

-- Create policy for logo deletion
CREATE POLICY "Organization owners can delete logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND EXISTS (
    SELECT 1 FROM organization_members m
    JOIN organizations o ON o.id = m.organization_id
    WHERE m.user_id = auth.uid() 
    AND m.role IN ('owner', 'admin')
  )
);