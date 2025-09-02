-- Fix remaining security issues

-- 1. Fix remaining functions without search_path protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;