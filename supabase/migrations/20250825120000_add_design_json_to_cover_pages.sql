-- Add design_json column to cover_pages table
ALTER TABLE public.cover_pages
  ADD COLUMN IF NOT EXISTS design_json jsonb NOT NULL DEFAULT '{}'::jsonb;
