create extension if not exists pgcrypto;

-- Cloud profiles are optional. The website also supports local-only profiles.
create table if not exists public.birth_profiles (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 70),
 birth_date date not null,
 birth_time time,
 birth_place text not null check (char_length(birth_place) between 2 and 180),
 time_accuracy text not null default 'exact' check (time_accuracy in ('exact','approximate','unknown')),
 created_at timestamptz not null default now()
);
create index if not exists birth_profiles_user_id_idx on public.birth_profiles(user_id);
alter table public.birth_profiles enable row level security;
drop policy if exists "Users manage own birth profiles" on public.birth_profiles;
create policy "Users manage own birth profiles" on public.birth_profiles
 for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Authenticated question history is private. Anonymous sessions keep history in browser storage.
create table if not exists public.oracle_questions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 profile_id uuid references public.birth_profiles(id) on delete set null,
 question text not null check (char_length(question) between 3 and 1200),
 answer text not null,
 language text not null check (language in ('en','hi','hinglish')),
 created_at timestamptz not null default now()
);
create index if not exists oracle_questions_user_created_idx on public.oracle_questions(user_id,created_at desc);
alter table public.oracle_questions enable row level security;
drop policy if exists "Users read own oracle questions" on public.oracle_questions;
create policy "Users read own oracle questions" on public.oracle_questions
 for select to authenticated using (auth.uid() = user_id);
revoke all on public.oracle_questions from anon, authenticated;
grant select on public.oracle_questions to authenticated;
revoke all on public.birth_profiles from anon;
grant select,insert,update,delete on public.birth_profiles to authenticated;
