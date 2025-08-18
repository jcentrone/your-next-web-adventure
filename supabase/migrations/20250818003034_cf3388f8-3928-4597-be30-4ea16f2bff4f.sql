-- Add report_type column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'home_inspection';

-- Add report_data column for type-specific data
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_data JSONB;

-- Add an index for better performance on report_type queries
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);