create extension if not exists pgcrypto;
create table if not exists public.birth_profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 70), birth_date date not null,
 birth_time time, birth_place text not null check (char_length(birth_place) between 2 and 180),
 time_accuracy text not null default 'exact' check (time_accuracy in ('exact','approximate','unknown')),
 created_at timestamptz not null default now()
);
create index if not exists birth_profiles_user_id_idx on public.birth_profiles(user_id);
alter table public.birth_profiles enable row level security;
drop policy if exists "Users manage own birth profiles" on public.birth_profiles;
create policy "Users manage own birth profiles" on public.birth_profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create table if not exists public.oracle_usage (
 user_id uuid primary key references auth.users(id) on delete cascade,
 free_used integer not null default 0 check (free_used between 0 and 5), updated_at timestamptz not null default now()
);
alter table public.oracle_usage enable row level security;
drop policy if exists "Users read own oracle usage" on public.oracle_usage;
create policy "Users read own oracle usage" on public.oracle_usage for select to authenticated using (auth.uid() = user_id);
create table if not exists public.oracle_questions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 profile_id uuid not null references public.birth_profiles(id) on delete cascade,
 question text not null check (char_length(question) between 3 and 1200), answer text not null,
 language text not null check (language in ('en','hi','hinglish')), created_at timestamptz not null default now()
);
create index if not exists oracle_questions_user_created_idx on public.oracle_questions(user_id,created_at desc);
alter table public.oracle_questions enable row level security;
drop policy if exists "Users read own oracle questions" on public.oracle_questions;
create policy "Users read own oracle questions" on public.oracle_questions for select to authenticated using (auth.uid() = user_id);
revoke all on public.oracle_usage from anon, authenticated;
grant select on public.oracle_usage to authenticated;
revoke all on public.oracle_questions from anon, authenticated;
grant select on public.oracle_questions to authenticated;
revoke all on public.birth_profiles from anon;
grant select,insert,update,delete on public.birth_profiles to authenticated;
create or replace function public.reserve_oracle_question() returns boolean language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); used integer;
begin
 if uid is null then raise exception 'not_authenticated'; end if;
 insert into public.oracle_usage(user_id,free_used) values(uid,0) on conflict(user_id) do nothing;
 select free_used into used from public.oracle_usage where user_id=uid for update;
 if used >= 5 then return false; end if;
 update public.oracle_usage set free_used=free_used+1,updated_at=now() where user_id=uid;
 return true;
end; $$;
create or replace function public.refund_oracle_question() returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 update public.oracle_usage set free_used=greatest(0,free_used-1),updated_at=now() where user_id=auth.uid();
end; $$;
revoke all on function public.reserve_oracle_question() from public,anon;
revoke all on function public.refund_oracle_question() from public,anon;
grant execute on function public.reserve_oracle_question() to authenticated;
grant execute on function public.refund_oracle_question() to authenticated;
