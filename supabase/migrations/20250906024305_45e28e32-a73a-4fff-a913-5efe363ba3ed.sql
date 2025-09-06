-- Add contact_ids column to reports table for multiple contact support
ALTER TABLE public.reports 
ADD COLUMN contact_ids jsonb DEFAULT '[]'::jsonb;

-- Create index for better performance on contact_ids queries
CREATE INDEX idx_reports_contact_ids ON public.reports USING gin(contact_ids);

-- Migrate existing contact_id values to contact_ids array
UPDATE public.reports 
SET contact_ids = jsonb_build_array(contact_id::text)
WHERE contact_id IS NOT NULL AND contact_ids = '[]'::jsonb;