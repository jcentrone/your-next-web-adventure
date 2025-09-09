-- Add tags columns to accounts, contacts, and reports
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Ensure existing rows have an empty array
UPDATE public.accounts SET tags = '{}' WHERE tags IS NULL;
UPDATE public.contacts SET tags = '{}' WHERE tags IS NULL;
UPDATE public.reports SET tags = '{}' WHERE tags IS NULL;
