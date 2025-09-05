-- Fix contacts table RLS policies to be more restrictive and secure
-- Current issue: Organization admins/owners can see ALL contacts in their org
-- This is too permissive and could expose sensitive customer data

-- First, let's drop the current overly permissive policies
DROP POLICY IF EXISTS "Secure contact viewing policy" ON public.contacts;
DROP POLICY IF EXISTS "Secure contact update policy" ON public.contacts;
DROP POLICY IF EXISTS "Secure contact deletion policy" ON public.contacts;

-- Create more restrictive policies for contacts
-- 1. Users can only view contacts they created OR contacts associated with their own reports/appointments
CREATE POLICY "Users can view own contacts and related contacts" 
ON public.contacts 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR (
    organization_id IS NOT NULL 
    AND is_organization_member(organization_id)
    AND (
      -- Contact is associated with user's reports
      EXISTS (
        SELECT 1 FROM reports 
        WHERE reports.contact_id = contacts.id 
        AND reports.user_id = auth.uid()
      )
      OR
      -- Contact is associated with user's appointments  
      EXISTS (
        SELECT 1 FROM appointments 
        WHERE appointments.contact_id = contacts.id 
        AND appointments.user_id = auth.uid()
      )
      OR
      -- Organization owners/admins can only see contacts that have actual business relationships
      (
        (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
        AND (
          EXISTS (SELECT 1 FROM reports WHERE reports.contact_id = contacts.id AND reports.organization_id = organization_id)
          OR EXISTS (SELECT 1 FROM appointments WHERE appointments.contact_id = contacts.id AND appointments.organization_id = organization_id)
        )
      )
    )
  )
);

-- 2. Users can only update contacts they created OR organization admins can update contacts with business relationships
CREATE POLICY "Users can update own contacts and admins can update related contacts" 
ON public.contacts 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR (
    organization_id IS NOT NULL 
    AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
    AND (
      EXISTS (SELECT 1 FROM reports WHERE reports.contact_id = contacts.id AND reports.organization_id = organization_id)
      OR EXISTS (SELECT 1 FROM appointments WHERE appointments.contact_id = contacts.id AND appointments.organization_id = organization_id)
    )
  )
);

-- 3. Users can only delete contacts they created OR organization owners can delete contacts with business relationships
CREATE POLICY "Users can delete own contacts and owners can delete related contacts" 
ON public.contacts 
FOR DELETE 
USING (
  user_id = auth.uid() 
  OR (
    organization_id IS NOT NULL 
    AND has_organization_role(organization_id, 'owner'::organization_role)
    AND (
      EXISTS (SELECT 1 FROM reports WHERE reports.contact_id = contacts.id AND reports.organization_id = organization_id)
      OR EXISTS (SELECT 1 FROM appointments WHERE appointments.contact_id = contacts.id AND appointments.organization_id = organization_id)
    )
  )
);

-- Keep the existing secure insertion policy as it's already restrictive
-- Users can only insert contacts for themselves
-- This policy already exists and is secure: "Secure contact insertion policy"

-- Add a comment explaining the security improvement
COMMENT ON TABLE public.contacts IS 'Contains sensitive customer contact information. RLS policies ensure contacts are only accessible to their creators and organization members with legitimate business relationships (through reports or appointments).';

-- Create a function to help with contact access auditing (optional, for monitoring)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;