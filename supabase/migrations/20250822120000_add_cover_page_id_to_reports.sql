-- Add cover_page_id column to reports table
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS cover_page_id uuid REFERENCES cover_pages(id);

CREATE INDEX IF NOT EXISTS idx_reports_cover_page_id ON reports(cover_page_id);
