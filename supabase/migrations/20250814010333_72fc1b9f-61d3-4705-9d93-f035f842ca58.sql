-- Create or replace the handle_new_user function to include organization creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the profile
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

  -- If this is an organization admin, create the organization
  IF (NEW.raw_user_meta_data->>'is_organization_admin')::boolean = true 
     AND NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
    
    -- Create the organization
    INSERT INTO public.organizations (
      name,
      email,
      phone,
      license_number
    )
    VALUES (
      NEW.raw_user_meta_data->>'organization_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'license_number'
    );

    -- Update the profile to be part of the organization
    UPDATE public.profiles 
    SET 
      organization_id = (
        SELECT id FROM public.organizations 
        WHERE name = NEW.raw_user_meta_data->>'organization_name' 
        AND email = NEW.email 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      is_individual = false
    WHERE user_id = NEW.id;

    -- Add the user as the organization owner
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role
    )
    VALUES (
      (
        SELECT id FROM public.organizations 
        WHERE name = NEW.raw_user_meta_data->>'organization_name' 
        AND email = NEW.email 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      NEW.id,
      'owner'::organization_role
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();