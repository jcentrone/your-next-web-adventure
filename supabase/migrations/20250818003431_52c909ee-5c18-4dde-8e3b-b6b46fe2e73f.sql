-- Make sections column nullable since wind mitigation reports use report_data instead
ALTER TABLE reports ALTER COLUMN sections DROP NOT NULL;