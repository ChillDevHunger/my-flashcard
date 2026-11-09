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

-- Lịch ôn Leitner (hộp, ngày đến hạn, lần ôn gần nhất) + cài đặt số từ mới mỗi ngày (khóa "_cfg").
-- Chạy được nhiều lần; nếu chưa chạy thì app vẫn dùng được, chỉ không đồng bộ lịch ôn giữa các thiết bị.
alter table public.user_progress add column if not exists srs jsonb not null default '{}'::jsonb;
-- { "<deck>:<word>": {"box":1-5,"due":"yyyy-mm-dd","lastReviewed":"yyyy-mm-dd","added":"yyyy-mm-dd"}, "_cfg": {"newPerDay":10,"t":<ms>} }
