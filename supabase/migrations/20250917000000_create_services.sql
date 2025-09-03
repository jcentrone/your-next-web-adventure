-- Create services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  price numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists services_user_id_idx on public.services (user_id);

-- Enable RLS
alter table public.services enable row level security;

-- Policies
create policy "Users can select own services"
  on public.services
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own services"
  on public.services
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own services"
  on public.services
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own services"
  on public.services
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger update_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- Create appointment_services join table
create table if not exists public.appointment_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists appointment_services_user_id_idx on public.appointment_services (user_id);
create index if not exists appointment_services_appointment_id_idx on public.appointment_services (appointment_id);
create index if not exists appointment_services_service_id_idx on public.appointment_services (service_id);

-- Enable RLS
alter table public.appointment_services enable row level security;

-- Policies
create policy "Users can select own appointment services"
  on public.appointment_services
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own appointment services"
  on public.appointment_services
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own appointment services"
  on public.appointment_services
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own appointment services"
  on public.appointment_services
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger update_appointment_services_updated_at
  before update on public.appointment_services
  for each row execute function public.set_updated_at();
