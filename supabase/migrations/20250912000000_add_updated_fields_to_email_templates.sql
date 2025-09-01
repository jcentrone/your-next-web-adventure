-- Add updated_at and updated_by columns to email_templates for tracking edits
ALTER TABLE public.email_templates
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN updated_by UUID REFERENCES auth.users(id);
