-- Create user_custom_fields table for managing custom fields in sections
CREATE TABLE public.user_custom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  section_key TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('text', 'textarea', 'select', 'multiselect', 'number', 'date', 'contact_lookup')),
  options JSONB DEFAULT '[]'::jsonb,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_key, field_name)
);

-- Enable RLS on user_custom_fields
ALTER TABLE public.user_custom_fields ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_custom_fields
CREATE POLICY "Users can view their own custom fields"
  ON public.user_custom_fields
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (organization_id IS NOT NULL AND is_organization_member(organization_id))
  );

CREATE POLICY "Users can create their own custom fields"
  ON public.user_custom_fields
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom fields"
  ON public.user_custom_fields
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    (organization_id IS NOT NULL AND is_organization_member(organization_id))
  );

CREATE POLICY "Users can delete their own custom fields"
  ON public.user_custom_fields
  FOR DELETE
  USING (
    user_id = auth.uid() OR 
    (organization_id IS NOT NULL AND (
      has_organization_role(organization_id, 'owner'::organization_role) OR 
      has_organization_role(organization_id, 'admin'::organization_role)
    ))
  );

-- Create indexes for performance
CREATE INDEX idx_user_custom_fields_user_id ON public.user_custom_fields(user_id);
CREATE INDEX idx_user_custom_fields_section_key ON public.user_custom_fields(section_key);
CREATE INDEX idx_user_custom_fields_sort_order ON public.user_custom_fields(user_id, section_key, sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_user_custom_fields_updated_at
  BEFORE UPDATE ON public.user_custom_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();