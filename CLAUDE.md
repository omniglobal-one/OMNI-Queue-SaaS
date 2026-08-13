# OMNI Queue

## Architecture
Next.js 15 App Router, Supabase (Auth + DB + Realtime + push notifications), TypeScript strict.

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key
- SUPABASE_SERVICE_ROLE_KEY — Service role (server-only)

## Deployment Notes
- Supabase ref (production, verified 2026-08-13): `vjltmyirmkmqtybiekyp`
- Vercel: `omni-queue-saas.vercel.app`
- Primary color: `#2563EB` (blue-600)

## Incident Log

### 2026-08-13 — Supabase project paused
**Cause:** The Supabase project (`vjltmyirmkmqtybiekyp`) had auto-paused (free tier inactivity), which would have broken auth/DB access the same way it did for OMNI Share the same day (see OMNI Share SaaS/CLAUDE.md incident log).

**Fix:** Verified the ref actually in use by reading Vercel's production env var (`NEXT_PUBLIC_SUPABASE_URL`) first — confirmed it matched the documented ref — then restored via `POST /v1/projects/vjltmyirmkmqtybiekyp/restore` and polled `GET /v1/projects` until `status: ACTIVE_HEALTHY`. Site confirmed back to `200 OK`.

### 2026-08-13 — Production readiness audit + fixes
A full audit found three tables granting the public `anon` role far more than intended:
`tickets_public_read` (`using(true)`) exposed every customer's name/phone across every
merchant with no login; `queues_public_read` (`using(true)`) exposed every queue's plaintext
passcode the same way; `tickets_public_insert` (`with check(true)`) let anyone insert
arbitrary tickets directly via PostgREST, bypassing passcode/status/max-tickets/duplicate
checks that only existed in app code. A merchant-dashboard settings page also had no
ownership filter, relying entirely on the (broken) RLS to scope reads.

**Fixed same day**, migration `004_close_public_data_leaks.sql`:
- Dropped all three public policies. Every server-rendered page, API route, and server action
  already used the service-role client (bypasses RLS entirely) — the only real consumers of
  the public grants were two client-side hooks reading directly via the browser's anon
  client.
- `hooks/useQueueRealtime.ts` (customer ticket-tracking page) rewritten to poll the existing
  `getTicketWithPosition` server action (4s interval) instead of subscribing to Postgres
  changes as anon — that action already computed exactly what the page needs via the
  service-role client, without ever exposing other customers' rows.
- Added `tickets_merchant_read`/`tickets_admin_read`/`queues_admin_read` policies so
  `hooks/useMerchantQueueRealtime.ts` (authenticated merchant dashboard) keeps working
  correctly with proper ownership scoping instead of the removed blanket grant.
- Added `app/actions/queues.ts:getOwnQueue()` and switched
  `app/dashboard/queues/[id]/settings/page.tsx` to use it instead of an unscoped direct
  table query.
- `migration 005_rate_limiting.sql` — added an IP-based rate limit (8/min) on `joinQueue`,
  the one fully public write endpoint in the app, via a `rate_limits` table + `check_rate_limit()`
  function (same pattern as OMNI Rewards — no Redis dependency).

Also fixed: push-notification ticket links used `queue_id` instead of `queue.slug`
(inconsistent with the join form, latent breakage risk); deleted the orphaned, unused
`app/api/ticket/[id]` route (dead code duplicating `getTicketWithPosition` with no caller);
narrowed `SuppressRealtimeErrors` to only swallow actual WebSocket close/error events instead
of any Event-shaped rejection app-wide; fixed a double-encoded UTF-8 `display_name` on the
Café Aroma demo account (`CafÃ© Aroma` → `Café Aroma`) — root cause is in whatever external
script originally created the accounts, which isn't in this repo (see "no seed script"
below); corrected landing-page and join-form copy that implied WhatsApp alerts send
automatically (they're currently a one-tap manual send from the merchant dashboard).

**Note:** this project has no committed seed script — `markdowns/CREDENTIALS.md` (added
2026-08-13) documents the real accounts, but there's no way to reproduce them from scratch
in this repo. If new merchant accounts are ever created outside the app's own UI, make sure
non-ASCII business names are passed as proper UTF-8, not re-encoded.

All RLS/data fixes verified live against production (anon reads/inserts blocked, merchant's
own reads still work) before being committed.
