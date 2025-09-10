create extension if not exists vector;

create table if not exists public.support_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  embedding vector(1536)
);
