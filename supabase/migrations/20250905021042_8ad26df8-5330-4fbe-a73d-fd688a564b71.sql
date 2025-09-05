-- Fix the search path security issue for the audit function
DROP FUNCTION IF EXISTS public.audit_contact_access();

CREATE OR REPLACE FUNCTION public.audit_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when contacts are accessed by organization members
  IF TG_OP = 'SELECT' AND OLD.user_id != auth.uid() THEN
    INSERT INTO activities (
      title,
      description,
      activity_type,
      contact_id,
      user_id,
      organization_id
    ) VALUES (
      'Contact Accessed',
      'Contact accessed by organization member',
      'contact_view',
      NEW.id,
      auth.uid(),
      NEW.organization_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;