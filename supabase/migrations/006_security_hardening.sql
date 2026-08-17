-- Fixes from the deeper security assessment (2026-08-17):
--
-- 1. check_rate_limit / increment_and_get_counter were SECURITY DEFINER functions with no
--    explicit EXECUTE revoke — Postgres grants EXECUTE to PUBLIC by default, so PostgREST
--    exposed both at /rest/v1/rpc/<name> to the anon key. Live-confirmed exploitable: an
--    attacker could call check_rate_limit directly with a victim's IP as the key to grief-lock
--    them out of the real join flow, or call increment_and_get_counter directly to corrupt
--    ticket numbering with no rate limit at all (bypassing the limiter meant to protect it).
--
-- 2. max_tickets and duplicate-invoice checks in joinQueue were check-then-insert with no
--    DB-level lock — a burst of concurrent requests near the cap/duplicate boundary could all
--    pass the check before any commit. Enforced atomically here instead.
--
-- 3. push_subscriptions_insert was `with check (true)` — any ticket_id/queue_id combination,
--    real or fabricated, was accepted. Scoped to require the ticket to actually exist, belong
--    to the stated queue, and still be active.

revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

revoke execute on function public.increment_and_get_counter(uuid) from public, anon, authenticated;
grant execute on function public.increment_and_get_counter(uuid) to service_role;

-- ── Atomic max_tickets enforcement ──────────────────────────────────────────
create or replace function public.enforce_max_tickets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
  cap int;
begin
  select max_tickets into cap from public.queues where id = new.queue_id for update;
  if cap is null then
    return new; -- no cap configured for this queue
  end if;

  select count(*) into current_count from public.tickets
    where queue_id = new.queue_id and status = 'pending';

  if current_count >= cap then
    raise exception 'max_tickets_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_max_tickets on public.tickets;
create trigger trg_enforce_max_tickets
  before insert on public.tickets
  for each row execute function public.enforce_max_tickets();

-- ── Atomic duplicate-invoice prevention ─────────────────────────────────────
create unique index if not exists idx_tickets_unique_active_invoice
  on public.tickets(queue_id, invoice_number)
  where status in ('pending', 'in_progress') and invoice_number is not null;

-- ── Scope push_subscriptions insert to real, active tickets ────────────────
drop policy if exists "push_subs_insert" on public.push_subscriptions;
create policy "push_subs_insert" on public.push_subscriptions
  for insert
  with check (
    exists (
      select 1 from public.tickets t
      where t.id = push_subscriptions.ticket_id
        and t.queue_id = push_subscriptions.queue_id
        and t.status in ('pending', 'in_progress')
    )
  );
