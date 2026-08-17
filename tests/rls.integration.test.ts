// Integration/RLS regression tests — run against a local Supabase stack (`supabase start`,
// requires Docker). These replicate the exploit checks that were done manually, by hand,
// against production during the 2026-08-17 security assessment — turning "I verified this
// once with a live curl command" into something that reruns automatically and would fail
// loudly if a future migration or policy change reintroduced any of these holes.
//
// Run with: npm run test:integration  (requires `supabase start` to be running first)
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const ANON_KEY = process.env.SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are not set. Run `supabase status` after ' +
    '`supabase start` and export them (see package.json test:integration script) before running this suite.'
  )
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function clientAs(email: string, password: string): Promise<SupabaseClient> {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`)
  return client
}

const PASSWORD = 'Test@2026!Integration'
const RUN_ID = Date.now().toString(36)

const emails = {
  merchantA: `merchant-a-${RUN_ID}@test.local`,
  merchantB: `merchant-b-${RUN_ID}@test.local`,
}

let merchantAId: string, merchantBId: string
let queueAId: string, queueASlug: string
let queueBId: string
let ticketInQueueBId: string

beforeAll(async () => {
  for (const [key, email] of Object.entries(emails)) {
    const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true })
    if (error) throw error
    if (key === 'merchantA') merchantAId = data.user.id
    if (key === 'merchantB') merchantBId = data.user.id
  }
  // handle_new_user trigger creates a 'merchant' profile row automatically; give each a slug.
  await admin.from('profiles').update({ business_name: `Merchant A ${RUN_ID}`, business_slug: `merchant-a-${RUN_ID}` }).eq('id', merchantAId)
  await admin.from('profiles').update({ business_name: `Merchant B ${RUN_ID}`, business_slug: `merchant-b-${RUN_ID}` }).eq('id', merchantBId)

  queueASlug = `queue-a-${RUN_ID}`
  const { data: queueA, error: qAErr } = await admin.from('queues')
    .insert({ merchant_id: merchantAId, name: `Queue A ${RUN_ID}`, slug: queueASlug, mode: 'auto', status: 'open', passcode: '1234' })
    .select('id').single()
  if (qAErr) throw qAErr
  queueAId = queueA.id

  const { data: queueB, error: qBErr } = await admin.from('queues')
    .insert({ merchant_id: merchantBId, name: `Queue B ${RUN_ID}`, slug: `queue-b-${RUN_ID}`, mode: 'auto', status: 'open' })
    .select('id').single()
  if (qBErr) throw qBErr
  queueBId = queueB.id

  const { data: ticket, error: tErr } = await admin.from('tickets')
    .insert({ queue_id: queueBId, ticket_number: 'A001', customer_name: 'Test Customer', customer_phone: '+60123456789', status: 'pending' })
    .select('id').single()
  if (tErr) throw tErr
  ticketInQueueBId = ticket.id
})

afterAll(async () => {
  await admin.from('tickets').delete().eq('queue_id', queueBId)
  await admin.from('queues').delete().in('id', [queueAId, queueBId])
  for (const id of [merchantAId, merchantBId]) {
    if (id) await admin.auth.admin.deleteUser(id)
  }
})

describe('tickets RLS — Critical fix, public PII leak (004)', () => {
  it('anon has no direct read access to tickets (customer names/phones) at all', async () => {
    const client = anonClient()
    const { data, error } = await client.from('tickets').select('id, customer_name, customer_phone')
    expect(error === null ? data?.length : 0).toBe(0)
  })

  it('anon cannot insert a ticket directly, bypassing joinQueue business rules', async () => {
    const client = anonClient()
    const { data, error } = await client.from('tickets')
      .insert({ queue_id: queueAId, ticket_number: 'HACK-1' })
      .select('id')
    expect(data ?? []).toHaveLength(0)
    expect(error).not.toBeNull()
  })
})

describe('queues RLS — Critical fix, passcode leak (004)', () => {
  it('anon has no direct read access to queues (passcodes) at all', async () => {
    const client = anonClient()
    const { data, error } = await client.from('queues').select('id, slug, passcode')
    expect(error === null ? data?.length : 0).toBe(0)
  })
})

describe('tickets_merchant_read — scoped replacement for the removed public policy (004)', () => {
  it('a merchant can read tickets in their own queue', async () => {
    const client = await clientAs(emails.merchantB, PASSWORD)
    const { data, error } = await client.from('tickets').select('id').eq('queue_id', queueBId)
    expect(error).toBeNull()
    expect(data?.map(r => r.id)).toContain(ticketInQueueBId)
  })

  it('a merchant cannot read tickets in another merchant\'s queue', async () => {
    const client = await clientAs(emails.merchantA, PASSWORD)
    const { data, error } = await client.from('tickets').select('id').eq('queue_id', queueBId)
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })
})

describe('push_subscriptions RLS — Medium fix, scoped insert (006)', () => {
  it('rejects a subscription for a fabricated ticket_id/queue_id pair', async () => {
    const client = anonClient()
    const { data, error } = await client.from('push_subscriptions')
      .insert({ ticket_id: '00000000-0000-0000-0000-000000000000', queue_id: queueAId, endpoint: 'https://fcm.googleapis.com/x', p256dh: 'a', auth: 'b' })
      .select('id')
    expect(data ?? []).toHaveLength(0)
    expect(error).not.toBeNull()
  })

  it('accepts a subscription for a real, active ticket in the matching queue', async () => {
    const client = anonClient()
    // Deliberately no .select() here: anon has no SELECT policy on push_subscriptions at all
    // (only a merchant reading their own queue's subscriptions does) — requesting the row
    // back via RETURNING would itself get RLS-rejected even though the INSERT succeeds, since
    // Postgres requires RETURNING rows to also pass a SELECT policy. This exactly matches how
    // the real app writes this table (subscribeToPush uses the service-role client and never
    // needs the anon insert to return anything) — anon inserting-without-reading-back is the
    // actual contract being verified here.
    const { error } = await client.from('push_subscriptions')
      .insert({ ticket_id: ticketInQueueBId, queue_id: queueBId, endpoint: 'https://fcm.googleapis.com/x', p256dh: 'a', auth: 'b' })
    expect(error).toBeNull()

    const verify = await admin.from('push_subscriptions').select('id').eq('ticket_id', ticketInQueueBId)
    expect(verify.data ?? []).toHaveLength(1)
    await admin.from('push_subscriptions').delete().eq('ticket_id', ticketInQueueBId)
  })
})

describe('RPC execute grants — High fix, lockdown (006)', () => {
  it('check_rate_limit is not callable by anon', async () => {
    const client = anonClient()
    const { error } = await client.rpc('check_rate_limit', { p_key: 'test', p_max_count: 5, p_window_seconds: 60 })
    expect(error).not.toBeNull()
  })

  it('increment_and_get_counter is not callable by anon', async () => {
    const client = anonClient()
    const { error } = await client.rpc('increment_and_get_counter', { queue_id: queueAId })
    expect(error).not.toBeNull()
  })
})

describe('max_tickets trigger — Medium fix, atomic enforcement (006)', () => {
  it('rejects a ticket insert once max_tickets is reached for that queue', async () => {
    await admin.from('queues').update({ max_tickets: 1 }).eq('id', queueAId)

    const first = await admin.from('tickets').insert({ queue_id: queueAId, ticket_number: 'A100', status: 'pending' })
    expect(first.error).toBeNull()

    const second = await admin.from('tickets').insert({ queue_id: queueAId, ticket_number: 'A101', status: 'pending' })
    expect(second.error).not.toBeNull()
    expect(second.error?.message).toContain('max_tickets_exceeded')

    await admin.from('tickets').delete().eq('queue_id', queueAId)
    await admin.from('queues').update({ max_tickets: null }).eq('id', queueAId)
  })
})

describe('duplicate-invoice unique index — Medium fix, atomic enforcement (006)', () => {
  it('rejects a second ticket with the same invoice number while the first is still active', async () => {
    const first = await admin.from('tickets').insert({ queue_id: queueAId, ticket_number: 'INV-1', invoice_number: 'INV-1', status: 'pending' })
    expect(first.error).toBeNull()

    const second = await admin.from('tickets').insert({ queue_id: queueAId, ticket_number: 'INV-1-dup', invoice_number: 'INV-1', status: 'pending' })
    expect(second.error).not.toBeNull()

    await admin.from('tickets').delete().eq('queue_id', queueAId)
  })
})
