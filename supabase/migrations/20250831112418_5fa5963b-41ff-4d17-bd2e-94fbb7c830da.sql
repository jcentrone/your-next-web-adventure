-- Add missing color_scheme and custom_colors columns to reports table
ALTER TABLE public.reports 
ADD COLUMN color_scheme text DEFAULT 'default',
ADD COLUMN custom_colors jsonb DEFAULT NULL;