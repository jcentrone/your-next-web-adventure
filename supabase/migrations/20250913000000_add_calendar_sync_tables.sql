-- Create calendar_tokens table for storing calendar provider tokens
create table if not exists public.calendar_tokens (
  user_id uuid not null,
  provider text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  primary key (user_id, provider)
);

-- Index for quick lookups by user
create index if not exists calendar_tokens_user_id_idx on public.calendar_tokens(user_id);

-- Create calendar_events table for mapping appointments to calendar events
create table if not exists public.calendar_events (
  user_id uuid not null,
  provider text not null,
  appointment_id uuid not null,
  event_id text not null,
  primary key (appointment_id, provider)
);

-- Index for quick lookups by user
create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
