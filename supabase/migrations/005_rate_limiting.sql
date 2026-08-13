-- Adds IP-based rate limiting for the public ticket-join endpoint (joinQueue). Nothing in
-- the app previously throttled this at all — combined with the now-fixed public-insert RLS
-- hole, an unauthenticated script could spam any queue's ticket counter without limit.
-- Auth endpoints already have Supabase's own platform-level rate limits; this covers the
-- fully custom endpoint that had none. Same table-based approach already used for OMNI
-- Rewards (no Redis dependency needed for this scale).

create table if not exists public.rate_limits (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limits_key_created on public.rate_limits(key, created_at);

create or replace function public.check_rate_limit(p_key text, p_max_count int, p_window_seconds int)
returns boolean
language plpgsql
security definer
as $$
declare
  current_count int;
begin
  delete from public.rate_limits
    where key = p_key and created_at < now() - (p_window_seconds || ' seconds')::interval;

  select count(*) into current_count
    from public.rate_limits
    where key = p_key and created_at >= now() - (p_window_seconds || ' seconds')::interval;

  if current_count >= p_max_count then
    return false;
  end if;

  insert into public.rate_limits (key) values (p_key);
  return true;
end;
$$;
