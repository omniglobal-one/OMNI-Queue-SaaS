-- Fixes a real bug caught by the new integration test suite: 006_security_hardening.sql's
-- push_subs_insert policy checks tickets via an inline EXISTS subquery, but 004 had already
-- removed anon's public SELECT on tickets. RLS subqueries are subject to the CALLER's own
-- policies unless wrapped in a SECURITY DEFINER function — so as anon, that EXISTS could never
-- see any ticket row and always evaluated false, silently rejecting every legitimate
-- subscription attempt (not just the fabricated-ticket-id ones it was meant to reject). Route
-- the check through a SECURITY DEFINER helper, same pattern already used elsewhere.

create or replace function public.ticket_is_active_in_queue(p_ticket_id uuid, p_queue_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from tickets
    where id = p_ticket_id
      and queue_id = p_queue_id
      and status in ('pending', 'in_progress')
  );
$$;

-- Unlike the other SECURITY DEFINER helpers in this codebase (which are locked to
-- service_role only), this one is deliberately left executable by anon/authenticated — the
-- whole point is that unauthenticated customers need to trigger it indirectly via the INSERT
-- policy below. It only ever returns a boolean, never any row data, so exposing it doesn't
-- reintroduce a read leak the way the other functions being anon-callable would have.

drop policy if exists "push_subs_insert" on public.push_subscriptions;
create policy "push_subs_insert" on public.push_subscriptions
  for insert
  with check (public.ticket_is_active_in_queue(ticket_id, queue_id));
