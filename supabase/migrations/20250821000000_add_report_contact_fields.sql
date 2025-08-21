-- Add contact and insurance fields to reports table
ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS phone_home TEXT,
    ADD COLUMN IF NOT EXISTS phone_work TEXT,
    ADD COLUMN IF NOT EXISTS phone_cell TEXT,
    ADD COLUMN IF NOT EXISTS insurance_company TEXT,
    ADD COLUMN IF NOT EXISTS policy_number TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT;
