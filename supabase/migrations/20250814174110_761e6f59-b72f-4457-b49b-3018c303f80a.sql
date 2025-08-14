-- Add Google-validated address fields to contacts table
ALTER TABLE public.contacts 
ADD COLUMN formatted_address text,
ADD COLUMN place_id text,
ADD COLUMN latitude numeric(10,8),
ADD COLUMN longitude numeric(11,8),
ADD COLUMN address_components jsonb;

-- Create contact relationships table for linking contacts
CREATE TABLE public.contact_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid,
  from_contact_id uuid NOT NULL,
  to_contact_id uuid NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('client-realtor', 'client-contractor', 'client-vendor', 'realtor-contractor', 'custom')),
  custom_relationship_label text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_contact_id, to_contact_id, relationship_type)
);

-- Enable RLS on contact relationships
ALTER TABLE public.contact_relationships ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact relationships
CREATE POLICY "Users can view their own contact relationships or organization relationships"
ON public.contact_relationships FOR SELECT
USING (
  user_id = auth.uid() OR 
  (organization_id IS NOT NULL AND is_organization_member(organization_id))
);

CREATE POLICY "Users can insert their own contact relationships"
ON public.contact_relationships FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contact relationships or organization relationships"
ON public.contact_relationships FOR UPDATE
USING (
  user_id = auth.uid() OR 
  (organization_id IS NOT NULL AND is_organization_member(organization_id))
);

CREATE POLICY "Users can delete their own contact relationships or organization relationships with proper role"
ON public.contact_relationships FOR DELETE
USING (
  user_id = auth.uid() OR 
  (organization_id IS NOT NULL AND (
    has_organization_role(organization_id, 'owner'::organization_role) OR
    has_organization_role(organization_id, 'admin'::organization_role)
  ))
);

-- Create indexes for better performance
CREATE INDEX idx_contact_relationships_from_contact ON public.contact_relationships(from_contact_id);
CREATE INDEX idx_contact_relationships_to_contact ON public.contact_relationships(to_contact_id);
CREATE INDEX idx_contact_relationships_user_org ON public.contact_relationships(user_id, organization_id);
CREATE INDEX idx_contacts_place_id ON public.contacts(place_id);

-- Create trigger for updated_at on contact_relationships
CREATE TRIGGER update_contact_relationships_updated_at
  BEFORE UPDATE ON public.contact_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();