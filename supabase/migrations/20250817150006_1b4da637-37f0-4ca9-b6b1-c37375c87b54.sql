-- Add archived column to reports table
ALTER TABLE public.reports 
ADD COLUMN archived boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering by archived status
CREATE INDEX idx_reports_archived ON public.reports(archived);

-- Add updated_at trigger if it doesn't exist for reports table
DROP TRIGGER IF EXISTS set_updated_at_reports ON public.reports;
CREATE TRIGGER set_updated_at_reports
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();