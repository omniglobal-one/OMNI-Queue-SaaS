-- 003_rls_audit.sql
-- Security audit fixes — RLS hardening for OMNI Queue SaaS.

-- ── Fix 1: profiles privilege escalation ─────────────────────────────────────
-- profiles_own_update had no WITH CHECK clause. A merchant could change their
-- own role from 'merchant' to 'admin' via a direct Supabase REST API call.
--
-- Fix: SECURITY DEFINER helper reads the current role; WITH CHECK locks it.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE AS
$func$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$func$;

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = public.current_user_role()
  );

-- ── Fix 2: queue_events open insert ──────────────────────────────────────────
-- The previous queue_events_insert policy had WITH CHECK (true), meaning any
-- anonymous caller could insert fake events for any queue (wrong status signals,
-- false "ticket served" events, etc.). Queue events are only created by server
-- actions running as the queue's merchant, so the insert should be restricted
-- to authenticated queue owners.

DROP POLICY IF EXISTS "queue_events_insert" ON public.queue_events;

CREATE POLICY "queue_events_insert" ON public.queue_events
  FOR INSERT TO authenticated
  WITH CHECK (
    queue_id IN (
      SELECT id FROM public.queues WHERE merchant_id = auth.uid()
    )
  );
