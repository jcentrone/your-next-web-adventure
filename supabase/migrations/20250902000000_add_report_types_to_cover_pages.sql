-- Add report_types column to cover_pages table
ALTER TABLE public.cover_pages
  ADD COLUMN IF NOT EXISTS report_types text[] NOT NULL DEFAULT ARRAY[]::text[];
