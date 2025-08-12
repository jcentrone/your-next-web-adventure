
-- 1) Create table for user-specific defect templates
create table if not exists public.user_defects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_key public.section_key not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text not null,
  recommendation text,
  media_guidance text,
  tags text[] not null default '{}',
  severity public.severity_level not null
);

-- 2) Keep updated_at in sync
create trigger set_updated_at_user_defects
before update on public.user_defects
for each row
execute procedure public.set_updated_at();

-- 3) Indexes for common queries
create index if not exists user_defects_user_id_idx on public.user_defects(user_id);
create index if not exists user_defects_user_section_idx on public.user_defects(user_id, section_key);

-- 4) Enable Row Level Security
alter table public.user_defects enable row level security;

-- 5) RLS policies - users can only manage their own personal defects
drop policy if exists "Users can view their own personal defects" on public.user_defects;
create policy "Users can view their own personal defects"
  on public.user_defects
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own personal defects" on public.user_defects;
create policy "Users can create their own personal defects"
  on public.user_defects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own personal defects" on public.user_defects;
create policy "Users can update their own personal defects"
  on public.user_defects
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own personal defects" on public.user_defects;
create policy "Users can delete their own personal defects"
  on public.user_defects
  for delete
  to authenticated
  using (auth.uid() = user_id);
