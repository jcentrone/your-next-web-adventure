-- Add security-definer helper and update policy

-- Create or replace helper function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = org_id
      AND m.user_id = auth.uid()
  );
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.is_organization_member(uuid) TO authenticated;

-- Update policy to use helper
DROP POLICY IF EXISTS "Members can select organization members" ON public.organization_members;

CREATE POLICY "Members can select organization members"
  ON public.organization_members FOR SELECT
  USING ( public.is_organization_member(organization_id) );
