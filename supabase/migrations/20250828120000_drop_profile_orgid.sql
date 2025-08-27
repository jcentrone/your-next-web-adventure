-- Backfill organization_members from existing profiles and drop organization_id/is_individual

-- Backfill membership for profiles with organization_id
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT p.organization_id, p.user_id, 'owner'::organization_role
FROM public.profiles p
WHERE p.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Remove duplicate memberships, keeping the earliest record per user
DELETE FROM public.organization_members om
USING public.organization_members om2
WHERE om.user_id = om2.user_id
  AND om.created_at > om2.created_at;

-- Add unique constraint to ensure a user belongs to at most one organization
ALTER TABLE public.organization_members
ADD CONSTRAINT organization_members_user_id_key UNIQUE (user_id);

-- Drop legacy columns from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS organization_id,
  DROP COLUMN IF EXISTS is_individual;

-- Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    avatar_url,
    provider,
    last_sign_in_at,
    phone,
    license_number
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.last_sign_in_at,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'license_number'
  );

  IF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
    INSERT INTO public.organizations (
      name,
      email,
      phone,
      license_number
    ) VALUES (
      NEW.raw_user_meta_data->>'organization_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'license_number'
    );

    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role
    ) VALUES (
      (SELECT id FROM public.organizations WHERE name = NEW.raw_user_meta_data->>'organization_name' AND email = NEW.email ORDER BY created_at DESC LIMIT 1),
      NEW.id,
      'owner'::organization_role
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
