
-- Create profiles table to store basic user data (no FK to auth.users)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists profiles_email_idx on public.profiles (lower(email));
create unique index if not exists profiles_user_id_key on public.profiles (user_id);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS: users can view their own profile
create policy if not exists "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

-- RLS: users can create their own profile
create policy if not exists "Users can create their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

-- RLS: users can update their own profile
create policy if not exists "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id);

-- Keep updated_at fresh
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
