-- 1) Create report_shares table
create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Helpful index for lookups by token
create unique index if not exists report_shares_token_idx on public.report_shares(token);

-- 2) Enable row level security
alter table public.report_shares enable row level security;

-- 3) Allow anonymous users to check tokens
create policy "Anonymous users can select by token"
  on public.report_shares
  for select
  to anon
  using (
    token = current_setting('request.headers', true)::json->>'x-report-share-token'
    and (expires_at is null or expires_at > now())
  );

-- 4) Allow anonymous access to reports via share token
create policy if not exists "Anonymous users can view shared reports"
  on public.reports
  for select
  to anon
  using (
    exists (
      select 1
      from public.report_shares rs
      where rs.report_id = public.reports.id
        and rs.token = current_setting('request.headers', true)::json->>'x-report-share-token'
        and (rs.expires_at is null or rs.expires_at > now())
    )
  );
