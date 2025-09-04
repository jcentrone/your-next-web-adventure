-- Create the missing terms-conditions storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('terms-conditions', 'terms-conditions', false);

-- Create RLS policies for the terms-conditions bucket
CREATE POLICY "Authenticated users can upload to terms-conditions bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'terms-conditions' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Organization members can view their terms documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'terms-conditions' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update their terms documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'terms-conditions' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can delete their terms documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'terms-conditions' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);