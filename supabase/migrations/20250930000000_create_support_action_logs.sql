create table if not exists public.support_action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
