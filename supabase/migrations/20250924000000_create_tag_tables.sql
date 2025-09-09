-- Create tables for account, contact, and report tags
create table if not exists public.account_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.contact_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.report_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Enable row level security
alter table public.account_tags enable row level security;
alter table public.contact_tags enable row level security;
alter table public.report_tags enable row level security;

-- Allow authenticated users to read and create tags
create policy "Authenticated users can view account tags"
  on public.account_tags for select
  to authenticated using (true);

create policy "Authenticated users can create account tags"
  on public.account_tags for insert
  to authenticated with check (true);

create policy "Authenticated users can view contact tags"
  on public.contact_tags for select
  to authenticated using (true);

create policy "Authenticated users can create contact tags"
  on public.contact_tags for insert
  to authenticated with check (true);

create policy "Authenticated users can view report tags"
  on public.report_tags for select
  to authenticated using (true);

create policy "Authenticated users can create report tags"
  on public.report_tags for insert
  to authenticated with check (true);
