-- Create custom report types table
CREATE TABLE public.custom_report_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'FileText',
  category TEXT DEFAULT 'custom',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_report_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own custom report types or organization types" 
ON public.custom_report_types 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR (organization_id IS NOT NULL AND is_organization_member(organization_id))
);

CREATE POLICY "Users can insert their own custom report types" 
ON public.custom_report_types 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom report types or organization types" 
ON public.custom_report_types 
FOR UPDATE 
USING (
  (user_id = auth.uid()) 
  OR (organization_id IS NOT NULL AND is_organization_member(organization_id))
);

CREATE POLICY "Users can delete their own custom report types or organization types with proper role" 
ON public.custom_report_types 
FOR DELETE 
USING (
  (user_id = auth.uid()) 
  OR (organization_id IS NOT NULL AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role)))
);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_report_types_updated_at
BEFORE UPDATE ON public.custom_report_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();