-- Create accounts table for companies/organizations that contacts belong to
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'company',
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  annual_revenue NUMERIC,
  employee_count INTEGER,
  user_id UUID NOT NULL,
  organization_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts or organization accounts" 
ON public.accounts 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (organization_id IS NOT NULL AND is_organization_member(organization_id))
);

CREATE POLICY "Users can insert their own accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own accounts or organization accounts" 
ON public.accounts 
FOR UPDATE 
USING (
  (user_id = auth.uid()) OR 
  (organization_id IS NOT NULL AND is_organization_member(organization_id))
);

CREATE POLICY "Users can delete their own accounts or organization accounts with proper role" 
ON public.accounts 
FOR DELETE 
USING (
  (user_id = auth.uid()) OR 
  (organization_id IS NOT NULL AND (
    has_organization_role(organization_id, 'owner'::organization_role) OR 
    has_organization_role(organization_id, 'admin'::organization_role)
  ))
);

-- Add account_id to contacts table
ALTER TABLE public.contacts ADD COLUMN account_id UUID REFERENCES public.accounts(id);

-- Create updated_at trigger for accounts
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_organization_id ON public.accounts(organization_id);
CREATE INDEX idx_contacts_account_id ON public.contacts(account_id);