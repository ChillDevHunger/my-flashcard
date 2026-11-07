-- Tiến độ học theo tài khoản: một dòng cho mỗi user.
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  known jsonb not null default '{}'::jsonb,   -- { "<deck>:<word>": 1 }
  weak jsonb not null default '{}'::jsonb,    -- { "<deck>:<word>": <số lần sai> }
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "select own progress" on public.user_progress
  for select using (auth.uid() = user_id);
create policy "insert own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.user_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
