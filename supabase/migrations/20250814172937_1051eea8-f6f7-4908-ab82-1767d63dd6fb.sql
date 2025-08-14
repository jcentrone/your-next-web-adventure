-- Add contact_id to reports table to link reports to contacts
ALTER TABLE public.reports ADD COLUMN contact_id uuid REFERENCES public.contacts(id);

-- Create index for better performance when querying reports by contact
CREATE INDEX idx_reports_contact_id ON public.reports(contact_id);

-- Add a function to get contact with all related data
CREATE OR REPLACE FUNCTION get_contact_with_related_data(contact_uuid uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'contact', row_to_json(c),
    'reports_count', (SELECT COUNT(*) FROM reports WHERE contact_id = contact_uuid),
    'appointments_count', (SELECT COUNT(*) FROM appointments WHERE contact_id = contact_uuid),
    'tasks_count', (SELECT COUNT(*) FROM tasks WHERE contact_id = contact_uuid),
    'activities_count', (SELECT COUNT(*) FROM activities WHERE contact_id = contact_uuid),
    'last_activity', (SELECT created_at FROM activities WHERE contact_id = contact_uuid ORDER BY created_at DESC LIMIT 1)
  )
  FROM contacts c
  WHERE c.id = contact_uuid;
$$;