-- Add appointment_id column to reports table and enforce 1-to-1 relationship with appointments
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL;

-- Each appointment can be linked to at most one report
ALTER TABLE public.reports
  ADD CONSTRAINT IF NOT EXISTS reports_appointment_id_key UNIQUE (appointment_id);

-- Each report can be linked to at most one appointment
ALTER TABLE public.appointments
  ADD CONSTRAINT IF NOT EXISTS appointments_report_id_key UNIQUE (report_id);
