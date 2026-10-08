-- BRUNIUH AI MUSIC V4
-- Run all of this in Supabase -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  credits integer not null default 10 check (credits >= 0),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  style text not null default '',
  audio_path text not null,
  duration_seconds integer not null default 180,
  provider text,
  provider_song_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  reference text unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "profile select own" on public.profiles;
create policy "profile select own" on public.profiles
for select to authenticated using (auth.uid() = id);

drop policy if exists "songs select own" on public.songs;
create policy "songs select own" on public.songs
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "transactions select own" on public.credit_transactions;
create policy "transactions select own" on public.credit_transactions
for select to authenticated using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 10)
  on conflict (id) do nothing;

  insert into public.credit_transactions(user_id, delta, reason, reference)
  values (new.id, 10, 'welcome_bonus', 'welcome_' || new.id::text)
  on conflict (reference) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.spend_credits(
  p_amount integer,
  p_reason text,
  p_reference text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  update public.profiles
  set credits = credits - p_amount
  where id = auth.uid()
    and credits >= p_amount
  returning credits into v_balance;

  if v_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.credit_transactions(user_id, delta, reason, reference)
  values (auth.uid(), -p_amount, p_reason, p_reference);

  return v_balance;
end;
$$;

revoke all on function public.spend_credits(integer,text,text) from public;
grant execute on function public.spend_credits(integer,text,text) to authenticated;

create or replace function public.refund_credits(
  p_user_id uuid,
  p_amount integer,
  p_reference text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_tx bigint;
begin
  insert into public.credit_transactions(user_id, delta, reason, reference)
  values (p_user_id, p_amount, 'generation_refund', 'refund_' || p_reference)
  on conflict (reference) do nothing
  returning id into v_tx;

  if v_tx is not null then
    update public.profiles
    set credits = credits + p_amount
    where id = p_user_id
    returning credits into v_balance;
  else
    select credits into v_balance from public.profiles where id = p_user_id;
  end if;

  return v_balance;
end;
$$;

revoke all on function public.refund_credits(uuid,integer,text) from public;
grant execute on function public.refund_credits(uuid,integer,text) to service_role;

create or replace function public.add_credits_from_stripe(
  p_user_id uuid,
  p_amount integer,
  p_session_id text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_tx bigint;
begin
  insert into public.credit_transactions(user_id, delta, reason, reference)
  values (p_user_id, p_amount, 'stripe_purchase', 'stripe_' || p_session_id)
  on conflict (reference) do nothing
  returning id into v_tx;

  if v_tx is not null then
    update public.profiles
    set credits = credits + p_amount
    where id = p_user_id
    returning credits into v_balance;
  else
    select credits into v_balance from public.profiles where id = p_user_id;
  end if;

  return v_balance;
end;
$$;

revoke all on function public.add_credits_from_stripe(uuid,integer,text) from public;
grant execute on function public.add_credits_from_stripe(uuid,integer,text) to service_role;

-- Audio files are stored in Cloudflare R2 in V4.3 LOW COST.


-- Useful indexes
create index if not exists songs_user_created_idx
  on public.songs(user_id, created_at desc);

create index if not exists credit_transactions_user_created_idx
  on public.credit_transactions(user_id, created_at desc);
