-- Create expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  expense_date date not null,
  category text,
  description text,
  amount numeric(10,2) not null,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists expenses_user_id_idx on public.expenses (user_id);
create index if not exists expenses_expense_date_idx on public.expenses (expense_date);

-- Enable Row Level Security
alter table public.expenses enable row level security;

-- Policies
create policy "Users can view their own expenses"
  on public.expenses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses
  for delete
  to authenticated
  using (auth.uid() = user_id);
