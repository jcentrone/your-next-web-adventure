-- Fix remaining database function security issues by setting search_path

-- Enable RLS on support_articles if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'support_articles' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.support_articles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create support_articles RLS policy if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'support_articles' 
        AND policyname = 'Authenticated users can view support articles'
    ) THEN
        CREATE POLICY "Authenticated users can view support articles" 
        ON public.support_articles 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Fix audit_contact_access function
CREATE OR REPLACE FUNCTION public.audit_contact_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;