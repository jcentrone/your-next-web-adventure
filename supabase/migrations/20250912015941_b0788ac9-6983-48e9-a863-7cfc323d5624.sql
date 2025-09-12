-- Fix database security issues

-- Add missing RLS policies for expense_categories table
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for expense_categories
CREATE POLICY "Users can view their own expense categories" 
ON public.expense_categories 
FOR SELECT 
USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own expense categories" 
ON public.expense_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense categories" 
ON public.expense_categories 
FOR UPDATE 
USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete their own expense categories" 
ON public.expense_categories 
FOR DELETE 
USING (auth.uid() = user_id AND is_default = false AND check_category_usage(name, auth.uid()) = 0);

-- Secure support_articles table to require authentication
ALTER TABLE public.support_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view support articles" 
ON public.support_articles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix function security issues by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

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

CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.assign_first_user_as_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if this is the first user in the system
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'master_admin') THEN
    INSERT INTO public.user_roles (user_id, role, created_by)
    VALUES (NEW.id, 'master_admin', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;