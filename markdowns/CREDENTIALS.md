# OMNI Queue SaaS — Credentials

Supabase ref: `vjltmyirmkmqtybiekyp` · **ACTIVE**
Production: `https://queue.omnidesk.one` (also live at `https://omni-queue-saas.vercel.app`)

This project previously had no committed credentials file — the accounts below existed but
were only documented in an external note, with no way to verify them from the repo itself.
Confirmed working live via the Auth REST API on 2026-08-13.

---

## Accounts

All passwords: **`OmniQueue2026!`**

| Email | Role | Business |
|-------|------|----------|
| admin@omniqueue.app | admin | — |
| cafe@omniqueue.app | merchant | Café Aroma |
| autoservice@omniqueue.app | merchant | KL Auto Service |

## Anonymous customers

Customers never create an account. They join a queue via `/q/[slug]` (QR code or shared
link) and track their ticket via `/q/[slug]/ticket/[ticketId]` — knowledge of the ticket URL
is the access mechanism, same pattern as an airline boarding-pass link.

## Role Permissions

| Role | Can do |
|------|--------|
| **admin** | Platform-wide: view/enable/disable/delete any merchant, manage any queue, platform stats |
| **merchant** | Create/manage their own queue(s), run auto or invoice mode, call next, view their own tickets/stats |
| **customer (anonymous)** | Join a queue, track their own ticket's live position, receive push/WhatsApp alerts |

## Seeded data

- `cafe-aroma-orders` — auto mode
- `cafe-aroma-service` — auto mode
- `kl-auto-service` — invoice mode
