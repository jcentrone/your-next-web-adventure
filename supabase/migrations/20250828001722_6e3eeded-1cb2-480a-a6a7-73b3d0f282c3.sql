-- Drop existing problematic storage policies
DROP POLICY IF EXISTS "Organization owners can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Organization owners can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Organization owners can delete logos" ON storage.objects;

-- Create simpler, working storage policies for logos
CREATE POLICY "Authenticated users can upload to logos folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'report-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid() IS NOT NULL
);