-- Create booking_settings table
create table if not exists public.booking_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  slug text not null,
  default_duration integer,
  advance_notice integer
);

-- Indexes
create index if not exists booking_settings_user_id_idx on public.booking_settings (user_id);
create unique index if not exists booking_settings_slug_key on public.booking_settings (slug);

-- Enable RLS
alter table public.booking_settings enable row level security;

-- Policies
create policy "Users can select own booking_settings"
  on public.booking_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own booking_settings"
  on public.booking_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own booking_settings"
  on public.booking_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own booking_settings"
  on public.booking_settings
  for delete
  to authenticated
  using (auth.uid() = user_id);
