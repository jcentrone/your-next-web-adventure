
-- Enums: section_key and severity_level
do $$
begin
  if not exists (select 1 from pg_type where typname = 'section_key') then
    create type public.section_key as enum (
      'roof', 'exterior', 'structure', 'heating', 'cooling',
      'plumbing', 'electrical', 'fireplace', 'attic', 'interior'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'severity_level') then
    create type public.severity_level as enum (
      'Info', 'Maintenance', 'Minor', 'Moderate', 'Major', 'Safety'
    );
  end if;
end
$$;

-- Helper trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Defects table: library of standardized defects
create table if not exists public.defects (
  id uuid primary key default gen_random_uuid(),
  section_key public.section_key not null,
  title text not null,
  description text not null,
  severity public.severity_level not null,
  recommendation text,
  media_guidance text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint defects_unique_section_title unique (section_key, title)
);

-- Section guidance: "What to inspect" per section (list of bullet items)
create table if not exists public.section_guidance (
  section_key public.section_key primary key,
  items text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers to keep updated_at fresh
drop trigger if exists set_updated_at_defects on public.defects;
create trigger set_updated_at_defects
before update on public.defects
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_section_guidance on public.section_guidance;
create trigger set_updated_at_section_guidance
before update on public.section_guidance
for each row
execute function public.set_updated_at();

-- RLS
alter table public.defects enable row level security;
alter table public.section_guidance enable row level security;

-- Policies
-- Read access for everyone (so app can read without auth)
drop policy if exists "Defects are readable by anyone" on public.defects;
create policy "Defects are readable by anyone"
  on public.defects
  for select
  to public
  using (true);

drop policy if exists "Section guidance is readable by anyone" on public.section_guidance;
create policy "Section guidance is readable by anyone"
  on public.section_guidance
  for select
  to public
  using (true);

-- Mutations restricted to authenticated users (tighten later if needed)
drop policy if exists "Authenticated can insert defects" on public.defects;
create policy "Authenticated can insert defects"
  on public.defects
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update defects" on public.defects;
create policy "Authenticated can update defects"
  on public.defects
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete defects" on public.defects;
create policy "Authenticated can delete defects"
  on public.defects
  for delete
  to authenticated
  using (true);

drop policy if exists "Authenticated can upsert section guidance" on public.section_guidance;
create policy "Authenticated can upsert section guidance"
  on public.section_guidance
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update section guidance" on public.section_guidance;
create policy "Authenticated can update section guidance"
  on public.section_guidance
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete section guidance" on public.section_guidance;
create policy "Authenticated can delete section guidance"
  on public.section_guidance
  for delete
  to authenticated
  using (true);

-- Seed section guidance with initial items (can be edited later)
insert into public.section_guidance (section_key, items)
values
  ('roof', array[
    'Inspect roof-covering materials (shingles, tiles, metal, membrane)',
    'Observe flashing, penetrations, and sealant conditions',
    'Inspect gutters, downspouts, and roof drainage',
    'Report methods used to inspect (roof walk/visual from ground)'
  ]),
  ('exterior', array[
    'Inspect siding, trim, and exterior wall coverings',
    'Observe soffits, fascia, and eaves',
    'Inspect walkways, driveways, steps, porches, and decks',
    'Examine grading and drainage near the foundation'
  ]),
  ('structure', array[
    'Describe foundation type and materials',
    'Observe visible structural components for movement or distress',
    'Report signs of moisture intrusion and wood-destroying organisms'
  ]),
  ('heating', array[
    'Operate heating system using normal controls',
    'Report the energy source and heating method',
    'Inspect visible components, venting, and combustion air'
  ]),
  ('cooling', array[
    'Operate cooling system using normal controls (weather permitting)',
    'Inspect condenser, evaporator (if accessible), condensate handling',
    'Report system type and observed conditions'
  ]),
  ('plumbing', array[
    'Describe water supply and distribution piping materials',
    'Inspect fixtures, faucets, drains, and visible leaks',
    'Inspect water heater, TPR valve, and venting'
  ]),
  ('electrical', array[
    'Inspect service drop and service equipment',
    'Inspect main disconnects, panels, and overcurrent devices',
    'Test a representative number of outlets, switches, and GFCI/AFCI (if present)'
  ]),
  ('fireplace', array[
    'Inspect readily accessible fireplaces, dampers, and hearths',
    'Observe clearances and evidence of improper operation'
  ]),
  ('attic', array[
    'Inspect attic insulation levels and distribution',
    'Observe ventilation (intake and exhaust)',
    'Inspect visible framing and moisture staining'
  ]),
  ('interior', array[
    'Inspect a representative number of doors and windows',
    'Observe walls, ceilings, floors for damage or moisture',
    'Test stairs/railings; report safety hazards (egress/guards)'
  ])
on conflict (section_key)
do update set
  items = excluded.items,
  updated_at = now();
