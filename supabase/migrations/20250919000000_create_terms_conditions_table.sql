-- Create terms_conditions table
create table if not exists public.terms_conditions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  report_type text,
  content_html text not null,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for organization lookups
create index if not exists terms_conditions_organization_id_idx on public.terms_conditions (organization_id);

-- Enable Row Level Security
alter table public.terms_conditions enable row level security;

-- Policy: organization members can view terms & conditions
create policy "Organization members can view terms conditions"
  on public.terms_conditions
  for select
  to authenticated
  using (public.is_organization_member(organization_id));

-- Policy: organization admins can manage terms & conditions
create policy "Organization admins can manage terms conditions"
  on public.terms_conditions
  for all
  to authenticated
  using (
    public.has_organization_role(organization_id, 'owner'::organization_role) or
    public.has_organization_role(organization_id, 'admin'::organization_role)
  )
  with check (
    public.has_organization_role(organization_id, 'owner'::organization_role) or
    public.has_organization_role(organization_id, 'admin'::organization_role)
  );

-- Trigger to keep updated_at current
create trigger set_updated_at_terms_conditions
  before update on public.terms_conditions
  for each row execute function public.set_updated_at();
