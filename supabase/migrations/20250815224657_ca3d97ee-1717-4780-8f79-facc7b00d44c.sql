-- Create user_custom_sections table for user-defined inspection sections
CREATE TABLE public.user_custom_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  title TEXT NOT NULL,
  section_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_key)
);

-- Enable Row Level Security
ALTER TABLE public.user_custom_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom sections" 
ON public.user_custom_sections 
FOR SELECT 
USING (user_id = auth.uid() OR ((organization_id IS NOT NULL) AND is_organization_member(organization_id)));

CREATE POLICY "Users can create their own custom sections" 
ON public.user_custom_sections 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom sections" 
ON public.user_custom_sections 
FOR UPDATE 
USING (user_id = auth.uid() OR ((organization_id IS NOT NULL) AND is_organization_member(organization_id)));

CREATE POLICY "Users can delete their own custom sections" 
ON public.user_custom_sections 
FOR DELETE 
USING (user_id = auth.uid() OR ((organization_id IS NOT NULL) AND (has_organization_role(organization_id, 'owner'::organization_role) OR has_organization_role(organization_id, 'admin'::organization_role))));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_custom_sections_updated_at
BEFORE UPDATE ON public.user_custom_sections
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_custom_sections_user_id ON public.user_custom_sections(user_id);
CREATE INDEX idx_user_custom_sections_organization_id ON public.user_custom_sections(organization_id);
CREATE INDEX idx_user_custom_sections_sort_order ON public.user_custom_sections(sort_order);