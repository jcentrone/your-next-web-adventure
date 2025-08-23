-- Enable RLS and policies for organizations, organization_members, and profiles

-- Enable row level security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners/admins can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

DROP POLICY IF EXISTS "Organization members can view other members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners/admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can insert themselves as members when accepting invitations" ON public.organization_members;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Policies for organizations
CREATE POLICY "Users can select their organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = id AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = id AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Allow creating a default organization when user has no membership
CREATE POLICY "Users can create default organization"
  ON public.organizations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.user_id = auth.uid()
    )
  );

-- Policies for organization_members
CREATE POLICY "Members can select organization members"
  ON public.organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organization_members.organization_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert their membership"
  ON public.organization_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update their membership"
  ON public.organization_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for profiles
CREATE POLICY "Users can select their profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
