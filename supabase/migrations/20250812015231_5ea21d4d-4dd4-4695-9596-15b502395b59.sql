
-- 1) Enum for report status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('Draft', 'Final');
  end if;
end
$$;

-- 2) Create reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  client_name text not null,
  address text not null,
  inspection_date date not null,
  status public.report_status not null default 'Draft',
  final_comments text,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Trigger to keep updated_at fresh
drop trigger if exists set_updated_at_on_reports on public.reports;
create trigger set_updated_at_on_reports
before update on public.reports
for each row execute function public.set_updated_at();

-- 4) RLS: only owners can see and modify their reports
alter table public.reports enable row level security;

drop policy if exists "Users can view their own reports" on public.reports;
create policy "Users can view their own reports"
  on public.reports
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own reports" on public.reports;
create policy "Users can insert their own reports"
  on public.reports
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reports" on public.reports;
create policy "Users can update their own reports"
  on public.reports
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reports" on public.reports;
create policy "Users can delete their own reports"
  on public.reports
  for delete
  using (auth.uid() = user_id);

-- 5) Helpful index for queries scoped by user
create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);
