'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatAutoTicketNumber, validateInvoiceNumber } from '@/lib/ticket-number'
import type { Queue, Ticket } from '@/types'

const NAME_MAX = 100
const PHONE_MAX = 20
const NOTES_MAX = 500
// Loose E.164-compatible pattern: optional +, then 7–15 digits with optional spaces/dashes/parens
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/

export async function joinQueue({
  queue_slug,
  customer_name,
  customer_phone,
  invoice_number,
  passcode,
}: {
  queue_slug: string
  customer_name?: string
  customer_phone?: string
  invoice_number?: string
  passcode?: string
}): Promise<{ ticket_id: string; queue_slug: string } | { error: string }> {
  if (!queue_slug || queue_slug.length > 100) return { error: 'Invalid queue' }

  // Server-side field validation
  if (customer_name !== undefined) {
    const n = customer_name.trim()
    if (n.length > NAME_MAX) return { error: `Name must be ${NAME_MAX} characters or less` }
  }
  if (customer_phone !== undefined) {
    const p = customer_phone.trim()
    if (p.length > PHONE_MAX) return { error: `Phone must be ${PHONE_MAX} characters or less` }
    if (p && !PHONE_RE.test(p)) return { error: 'Invalid phone number format' }
  }

  const admin = createAdminClient()

  // Fetch queue
  const { data: queueRaw, error: qErr } = await admin
    .from('queues')
    .select('*')
    .eq('slug', queue_slug)
    .single()

  const queue = queueRaw as Queue | null
  if (qErr || !queue) return { error: 'Queue not found' }
  if (queue.status !== 'open') return { error: 'QUEUE_NOT_ACCEPTING' }
  if (!queue.is_accepting) return { error: 'QUEUE_FULL' }

  // Passcode enforcement — constant-time comparison to prevent timing attacks
  if (queue.passcode) {
    if (!passcode || !/^\d{4}$/.test(passcode)) return { error: 'PASSCODE_REQUIRED' }
    const correct = queue.passcode
    let mismatch = correct.length ^ passcode.length
    for (let i = 0; i < Math.max(correct.length, passcode.length); i++) {
      mismatch |= (correct.charCodeAt(i % correct.length) ^ passcode.charCodeAt(i % passcode.length))
    }
    if (mismatch !== 0) return { error: 'PASSCODE_REQUIRED' }
  }

  // Check max tickets
  if (queue.max_tickets) {
    const { count } = await admin
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('queue_id', queue.id)
      .eq('status', 'pending')

    if ((count ?? 0) >= queue.max_tickets) {
      await admin.from('queues').update({ is_accepting: false }).eq('id', queue.id)
      return { error: 'QUEUE_FULL' }
    }
  }

  let ticket_number: string

  if (queue.mode === 'invoice') {
    if (!invoice_number) return { error: 'Invoice number is required' }
    const validationError = validateInvoiceNumber(invoice_number)
    if (validationError) return { error: validationError }

    // Check for duplicate
    const { data: existing } = await admin
      .from('tickets')
      .select('id')
      .eq('queue_id', queue.id)
      .eq('invoice_number', invoice_number.trim())
      .in('status', ['pending', 'in_progress'])
      .maybeSingle()

    if (existing) return { error: 'DUPLICATE_INVOICE' }
    ticket_number = invoice_number.trim()
  } else {
    // Auto mode — use RPC for atomic counter increment
    const { data: counterRaw, error: counterErr } = await admin
      .rpc('increment_and_get_counter', { queue_id: queue.id })

    if (counterErr || counterRaw === null) return { error: 'Failed to generate ticket number' }
    ticket_number = formatAutoTicketNumber(counterRaw as number)
  }

  // Count current pending for position snapshot
  const { count: pendingCount } = await admin
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('queue_id', queue.id)
    .eq('status', 'pending')

  const position = (pendingCount ?? 0) + 1

  const { data: ticketRaw, error: insertErr } = await admin
    .from('tickets')
    .insert({
      queue_id: queue.id,
      ticket_number,
      ...(queue.mode === 'invoice' ? { invoice_number: invoice_number?.trim() ?? null } : {}),
      customer_name: customer_name?.trim().slice(0, NAME_MAX) ?? null,
      customer_phone: customer_phone?.trim().slice(0, PHONE_MAX) ?? null,
      position,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertErr) return { error: 'Failed to join queue. Please try again.' }
  const ticketId = (ticketRaw as { id: string }).id

  await admin.from('queue_events').insert({
    queue_id: queue.id,
    ticket_id: ticketId,
    event_type: 'ticket_issued',
    payload: { ticket_number },
  })

  return { ticket_id: ticketId, queue_slug }
}

export async function updateCustomerPhone({
  ticket_id,
  phone,
}: {
  ticket_id: string
  phone: string
}): Promise<{ error?: string }> {
  const trimmed = phone.trim()
  if (!trimmed) return { error: 'Phone number is required' }
  if (trimmed.length > PHONE_MAX) return { error: `Phone must be ${PHONE_MAX} characters or less` }
  if (!PHONE_RE.test(trimmed)) return { error: 'Invalid phone number format. Include country code, e.g. +60123456789' }

  const admin = createAdminClient()

  // Verify the ticket is still active before allowing updates
  const { data: ticketRaw } = await admin.from('tickets').select('status').eq('id', ticket_id).single()
  const status = (ticketRaw as { status: string } | null)?.status
  if (!status) return { error: 'Ticket not found' }
  if (status === 'completed' || status === 'skipped') return { error: 'Ticket is no longer active' }

  const { error } = await admin
    .from('tickets')
    .update({ customer_phone: trimmed, updated_at: new Date().toISOString() })
    .eq('id', ticket_id)

  if (error) return { error: 'Failed to update. Please try again.' }
  return {}
}

export async function addInternalNote({
  ticket_id,
  notes,
}: {
  ticket_id: string
  notes: string
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!notes.trim()) return { error: 'Note cannot be empty' }
  if (notes.length > NOTES_MAX) return { error: `Notes must be ${NOTES_MAX} characters or less` }

  const admin = createAdminClient()

  // Verify the ticket belongs to one of this user's queues
  const { data: ticketRaw } = await admin.from('tickets').select('queue_id').eq('id', ticket_id).single()
  const ticket = ticketRaw as { queue_id: string } | null
  if (!ticket) return { error: 'Ticket not found' }

  const { data: queueRaw } = await admin.from('queues').select('merchant_id').eq('id', ticket.queue_id).single()
  const queue = queueRaw as { merchant_id: string } | null
  if (!queue || queue.merchant_id !== user.id) return { error: 'Forbidden' }

  const { error } = await admin
    .from('tickets')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', ticket_id)

  if (error) return { error: 'Failed to save note. Please try again.' }
  return {}
}

export async function getTicketWithPosition(ticket_id: string): Promise<{
  ticket: Ticket | null
  queue: Queue | null
  livePosition: number
  pendingAhead: number
}> {
  const admin = createAdminClient()

  const { data: ticketRaw } = await admin.from('tickets').select('*').eq('id', ticket_id).single()
  const ticket = ticketRaw as Ticket | null
  if (!ticket) return { ticket: null, queue: null, livePosition: 0, pendingAhead: 0 }

  const { data: queueRaw } = await admin.from('queues').select('*').eq('id', ticket.queue_id).single()
  const queue = queueRaw as Queue | null

  if (ticket.status !== 'pending') {
    return { ticket, queue, livePosition: 0, pendingAhead: 0 }
  }

  const { data: pendingRaw } = await admin
    .from('tickets')
    .select('id, created_at')
    .eq('queue_id', ticket.queue_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const pending = (pendingRaw ?? []) as { id: string; created_at: string }[]
  const idx = pending.findIndex(t => t.id === ticket_id)
  const livePosition = idx >= 0 ? idx + 1 : 0
  const pendingAhead = idx >= 0 ? idx : 0

  return { ticket, queue, livePosition, pendingAhead }
}
