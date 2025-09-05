-- Add fee column to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS fee numeric(10,2) NOT NULL DEFAULT 0;
