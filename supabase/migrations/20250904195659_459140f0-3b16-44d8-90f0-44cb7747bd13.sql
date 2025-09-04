-- Create terms-and-conditions storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'terms-and-conditions',
  'terms-and-conditions', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/pdf', 'text/plain']
);

-- Create RLS policies for terms-and-conditions bucket
CREATE POLICY "Users can upload their own terms documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'terms-and-conditions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own terms documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'terms-and-conditions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own terms documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'terms-and-conditions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own terms documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'terms-and-conditions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);