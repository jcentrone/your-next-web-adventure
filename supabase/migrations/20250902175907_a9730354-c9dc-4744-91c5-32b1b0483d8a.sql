-- Phase 1: Critical Security Fixes

-- 1. Enable RLS on calendar_events and create proper policies
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar events" 
ON public.calendar_events 
FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- 2. Restrict access to defects table to authenticated users only
DROP POLICY IF EXISTS "Defects are readable by anyone" ON public.defects;
DROP POLICY IF EXISTS "Authenticated can insert defects" ON public.defects;
DROP POLICY IF EXISTS "Authenticated can update defects" ON public.defects;
DROP POLICY IF EXISTS "Authenticated can delete defects" ON public.defects;

CREATE POLICY "Authenticated users can read defects" 
ON public.defects 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert defects" 
ON public.defects 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update defects" 
ON public.defects 
FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete defects" 
ON public.defects 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- 3. Restrict access to section_guidance table to authenticated users only
DROP POLICY IF EXISTS "Section guidance is readable by anyone" ON public.section_guidance;
DROP POLICY IF EXISTS "Authenticated can upsert section guidance" ON public.section_guidance;
DROP POLICY IF EXISTS "Authenticated can update section guidance" ON public.section_guidance;
DROP POLICY IF EXISTS "Authenticated can delete section guidance" ON public.section_guidance;

CREATE POLICY "Authenticated users can read section guidance" 
ON public.section_guidance 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert section guidance" 
ON public.section_guidance 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update section guidance" 
ON public.section_guidance 
FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete section guidance" 
ON public.section_guidance 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- 4. Add search_path protection to existing functions
CREATE OR REPLACE FUNCTION public.get_user_organization_role(user_uuid uuid)
 RETURNS organization_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role FROM public.organization_members 
  WHERE user_id = user_uuid AND user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT organization_id FROM public.organization_members 
  WHERE user_id = user_uuid AND user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_organization_role(org_id uuid, required_role organization_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid() 
    AND role = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_contact_with_related_data(contact_uuid uuid)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT json_build_object(
    'contact', row_to_json(c),
    'reports_count', (SELECT COUNT(*) FROM reports WHERE contact_id = contact_uuid),
    'appointments_count', (SELECT COUNT(*) FROM appointments WHERE contact_id = contact_uuid),
    'tasks_count', (SELECT COUNT(*) FROM tasks WHERE contact_id = contact_uuid),
    'activities_count', (SELECT COUNT(*) FROM activities WHERE contact_id = contact_uuid),
    'last_activity', (SELECT created_at FROM activities WHERE contact_id = contact_uuid ORDER BY created_at DESC LIMIT 1)
  )
  FROM contacts c
  WHERE c.id = contact_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.is_organization_member(org_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = org_id
      AND m.user_id = auth.uid()
  );
$function$;