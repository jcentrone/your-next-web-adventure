-- Add template and theme_color columns to booking_settings
ALTER TABLE public.booking_settings
  ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'templateA';
ALTER TABLE public.booking_settings
  ADD COLUMN IF NOT EXISTS theme_color text;
