-- First, drop the existing overly permissive RLS policies for contacts table
DROP POLICY IF EXISTS "Users can view their own contacts or organization contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts or organization contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts or organization contacts wi" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;

-- Create more secure RLS policies for contacts table

-- 1. SELECT Policy: Users can view their own contacts OR organization contacts if they have proper access
CREATE POLICY "Secure contact viewing policy" 
ON public.contacts 
FOR SELECT 
USING (
  -- Users can always see their own contacts
  user_id = auth.uid() 
  OR 
  -- For organization contacts, only allow access to admins/owners or if user is assigned to related reports/appointments
  (
    organization_id IS NOT NULL 
    AND (
      -- Admins and owners can see all organization contacts
      (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
      OR
      -- Inspectors can only see contacts they're working with (via reports or appointments)
      (
        has_organization_role(organization_id, 'inspector'::organization_role) 
        AND (
          EXISTS (SELECT 1 FROM reports WHERE contact_id = contacts.id AND user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM appointments WHERE contact_id = contacts.id AND user_id = auth.uid())
        )
      )
    )
  )
);

-- 2. INSERT Policy: Users can only insert contacts for themselves
CREATE POLICY "Secure contact insertion policy" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
);

-- 3. UPDATE Policy: Restrictive update access based on roles
CREATE POLICY "Secure contact update policy" 
ON public.contacts 
FOR UPDATE 
USING (
  -- Users can update their own contacts
  user_id = auth.uid() 
  OR 
  -- Organization admins/owners can update organization contacts
  (
    organization_id IS NOT NULL 
    AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
  )
  -- Note: Inspectors can only view but not update contacts they don't own
);

-- 4. DELETE Policy: Only owners/admins can delete organization contacts, users can delete their own
CREATE POLICY "Secure contact deletion policy" 
ON public.contacts 
FOR DELETE 
USING (
  -- Users can delete their own contacts
  user_id = auth.uid() 
  OR 
  -- Only organization owners/admins can delete organization contacts
  (
    organization_id IS NOT NULL 
    AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))
  )
);