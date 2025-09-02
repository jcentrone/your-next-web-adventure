-- Create ai_tokens table for storing user OpenAI API keys
create table if not exists public.ai_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  api_key text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (user_id)
);

-- Enable RLS
alter table public.ai_tokens enable row level security;

-- Policy: users manage their own AI tokens
create policy "Users can manage their own AI tokens"
  on public.ai_tokens
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace trigger set_ai_tokens_updated_at
  before update on public.ai_tokens
  for each row
  execute function public.set_updated_at();
