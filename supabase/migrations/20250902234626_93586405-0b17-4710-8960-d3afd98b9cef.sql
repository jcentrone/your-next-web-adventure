-- Add signature columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN signature_url text,
ADD COLUMN signature_type text;

-- Create signatures storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', false);

-- Create RLS policies for signatures bucket
CREATE POLICY "Users can view their own signatures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own signatures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own signatures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own signatures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);