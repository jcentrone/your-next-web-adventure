-- Fix overly permissive contact RLS policies to prevent unauthorized access to sensitive customer data

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own contacts and related contacts" ON public.contacts;

-- Create a more restrictive SELECT policy
-- Users can only view:
-- 1. Contacts they created themselves
-- 2. Contacts associated with reports/appointments they are assigned to
-- 3. Organization owners/admins can view contacts tied to their organization's reports/appointments
CREATE POLICY "Secure contact access policy" 
ON public.contacts 
FOR SELECT 
USING (
  -- Users can always see their own contacts
  user_id = auth.uid() 
  OR 
  -- Organization owners/admins can see contacts only if they're tied to organization reports/appointments
  (
    organization_id IS NOT NULL 
    AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
    AND (
      -- Contact is tied to a report in their organization
      EXISTS (
        SELECT 1 FROM reports 
        WHERE reports.contact_id = contacts.id 
        AND reports.organization_id = contacts.organization_id
      )
      OR
      -- Contact is tied to an appointment in their organization  
      EXISTS (
        SELECT 1 FROM appointments 
        WHERE appointments.contact_id = contacts.id 
        AND appointments.organization_id = contacts.organization_id
      )
    )
  )
  OR
  -- Users can see contacts tied to their specific reports/appointments (regardless of organization)
  (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.contact_id = contacts.id 
      AND reports.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.contact_id = contacts.id 
      AND appointments.user_id = auth.uid()
    )
  )
);

-- Update the UPDATE policy to be more restrictive as well
DROP POLICY IF EXISTS "Users can update own contacts and admins can update related con" ON public.contacts;

CREATE POLICY "Secure contact update policy" 
ON public.contacts 
FOR UPDATE 
USING (
  -- Users can update their own contacts
  user_id = auth.uid() 
  OR 
  -- Organization owners/admins can update contacts only if tied to their organization's business
  (
    organization_id IS NOT NULL 
    AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
    AND (
      EXISTS (
        SELECT 1 FROM reports 
        WHERE reports.contact_id = contacts.id 
        AND reports.organization_id = contacts.organization_id
      )
      OR
      EXISTS (
        SELECT 1 FROM appointments 
        WHERE appointments.contact_id = contacts.id 
        AND appointments.organization_id = contacts.organization_id
      )
    )
  )
);

-- Update the DELETE policy to be more restrictive
DROP POLICY IF EXISTS "Users can delete own contacts and owners can delete related con" ON public.contacts;

CREATE POLICY "Secure contact deletion policy" 
ON public.contacts 
FOR DELETE 
USING (
  -- Users can delete their own contacts
  user_id = auth.uid() 
  OR 
  -- Only organization owners can delete contacts tied to their organization
  (
    organization_id IS NOT NULL 
    AND has_organization_role(organization_id, 'owner'::organization_role)
    AND (
      EXISTS (
        SELECT 1 FROM reports 
        WHERE reports.contact_id = contacts.id 
        AND reports.organization_id = contacts.organization_id
      )
      OR
      EXISTS (
        SELECT 1 FROM appointments 
        WHERE appointments.contact_id = contacts.id 
        AND appointments.organization_id = contacts.organization_id
      )
    )
  )
);