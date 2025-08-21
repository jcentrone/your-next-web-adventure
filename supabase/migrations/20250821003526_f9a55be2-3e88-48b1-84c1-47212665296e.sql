-- Add wind mitigation specific fields to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS phone_home text,
ADD COLUMN IF NOT EXISTS phone_work text,
ADD COLUMN IF NOT EXISTS phone_cell text,
ADD COLUMN IF NOT EXISTS insurance_company text,
ADD COLUMN IF NOT EXISTS policy_number text,
ADD COLUMN IF NOT EXISTS email text;