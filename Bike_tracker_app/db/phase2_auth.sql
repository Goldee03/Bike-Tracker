-- Phase 2: per-user data with Row Level Security. Run once in Supabase SQL Editor.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "own row: select" on public.user_data;
drop policy if exists "own row: insert" on public.user_data;
drop policy if exists "own row: update" on public.user_data;
drop policy if exists "own row: delete" on public.user_data;

create policy "own row: select" on public.user_data for select to authenticated using (user_id = (select auth.uid()));
create policy "own row: insert" on public.user_data for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own row: update" on public.user_data for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own row: delete" on public.user_data for delete to authenticated using (user_id = (select auth.uid()));

-- Lock down the old shared table so nobody can read it through the public API.
-- (It stays in the database as a backup of your original data.)
alter table public.app_data enable row level security;
