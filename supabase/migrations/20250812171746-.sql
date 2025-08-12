-- Phase 1: Infrastructure setup for reports & media
-- 1) Add updated_at triggers to keep timestamps accurate

-- Reports
DROP TRIGGER IF EXISTS set_updated_at_on_reports ON public.reports;
CREATE TRIGGER set_updated_at_on_reports
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Defects (global library)
DROP TRIGGER IF EXISTS set_updated_at_on_defects ON public.defects;
CREATE TRIGGER set_updated_at_on_defects
BEFORE UPDATE ON public.defects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- User defects (personal library)
DROP TRIGGER IF EXISTS set_updated_at_on_user_defects ON public.user_defects;
CREATE TRIGGER set_updated_at_on_user_defects
BEFORE UPDATE ON public.user_defects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Section guidance
DROP TRIGGER IF EXISTS set_updated_at_on_section_guidance ON public.section_guidance;
CREATE TRIGGER set_updated_at_on_section_guidance
BEFORE UPDATE ON public.section_guidance
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2) Storage RLS for private bucket 'report-media'
-- Allow authenticated users to manage only their own folder (first folder = auth.uid())
-- Using storage.foldername(name) helper to extract the first path segment

-- READ
CREATE POLICY "Users can read their own report-media objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-media'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- CREATE/UPLOAD
CREATE POLICY "Users can upload to their report-media folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-media'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- UPDATE
CREATE POLICY "Users can update their own report-media objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'report-media'
  AND (auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'report-media'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- DELETE
CREATE POLICY "Users can delete their own report-media objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-media'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);
