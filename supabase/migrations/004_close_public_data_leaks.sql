-- Fixes Critical Findings from the 2026-08-13 production audit:
-- 1. tickets_public_read (using(true)) let anyone with the anon key read every customer's
--    name and phone number across every merchant, with no login required.
-- 2. queues_public_read (using(true)) let anyone with the anon key read every queue's
--    plaintext passcode, with no login required.
-- 3. tickets_public_insert (with check(true)) let anyone insert arbitrary tickets directly
--    via PostgREST, bypassing every business rule that only lives in app code (joinQueue):
--    passcode requirement, open/paused/closed status, max_tickets cap, duplicate-invoice check.
--
-- None of these grants were actually needed: every server-rendered page, API route, and server
-- action already reads/writes via the service-role client (app/q/[slug]/page.tsx,
-- app/actions/tickets.ts, app/actions/queues.ts, app/api/queue/[slug]/route.ts, etc.), which
-- bypasses RLS entirely. The only real consumers of these public policies were two client-side
-- hooks reading directly via the browser's Supabase client under the anon key
-- (hooks/useQueueRealtime.ts, hooks/useMerchantQueueRealtime.ts) — those have been switched to
-- go through authorised, scoped server actions instead (see accompanying app changes).

drop policy if exists "tickets_public_read" on public.tickets;
drop policy if exists "tickets_public_insert" on public.tickets;
drop policy if exists "queues_public_read" on public.queues;

-- useMerchantQueueRealtime reads tickets directly via the browser client under the merchant's
-- own authenticated session (not service role) — it had been relying on the now-removed public
-- read policy, which had no ownership scoping at all. Replace with a properly scoped read.
create policy "tickets_merchant_read" on public.tickets
  for select to authenticated
  using (
    exists (
      select 1 from public.queues q where q.id = queue_id and q.merchant_id = auth.uid()
    )
  );

-- Defense-in-depth: admin dashboard reads currently go through the service-role client, but
-- grant direct RLS access too so a future client-side admin view doesn't silently need the
-- public policies restored.
create policy "tickets_admin_read" on public.tickets
  for select to authenticated
  using (public.current_user_role() = 'admin');

create policy "queues_admin_read" on public.queues
  for select to authenticated
  using (public.current_user_role() = 'admin');
