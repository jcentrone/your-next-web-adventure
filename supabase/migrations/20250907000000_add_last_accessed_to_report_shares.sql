-- Add column to log last access for report share tokens
alter table public.report_shares
  add column if not exists last_accessed_at timestamptz;
