-- Create inspection_agreements table
create table if not exists public.inspection_agreements (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  client_name text,
  signed_at timestamptz,
  signature_url text,
  agreement_html text
);

-- Index for appointment lookups
create index if not exists inspection_agreements_appointment_id_idx on public.inspection_agreements (appointment_id);

-- Add agreement_id column to appointments table
alter table public.appointments
  add column agreement_id uuid references public.inspection_agreements(id);
