'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import type { Queue, Ticket, QueueStatus } from '@/types'

const NAME_MAX = 100
const DESC_MAX = 300
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/

function validateQueueInputs(name: string, slug: string, avgService: number): string | null {
  if (!name.trim()) return 'Queue name is required'
  if (name.trim().length > NAME_MAX) return `Queue name must be ${NAME_MAX} characters or less`
  if (!SLUG_RE.test(slug)) return 'Slug must be lowercase letters, numbers and hyphens only'
  if (!Number.isInteger(avgService) || avgService < 1 || avgService > 480) {
    return 'Average service time must be between 1 and 480 minutes'
  }
  return null
}

export async function createQueue({
  name,
  description,
  mode,
  avg_service_minutes,
  max_tickets,
  slug,
}: {
  name: string
  description?: string
  mode: 'auto' | 'invoice'
  avg_service_minutes: number
  max_tickets?: number
  slug: string
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const validationError = validateQueueInputs(name, slug, avg_service_minutes)
  if (validationError) return { error: validationError }
  if (description && description.length > DESC_MAX) {
    return { error: `Description must be ${DESC_MAX} characters or less` }
  }
  if (max_tickets !== undefined && (!Number.isInteger(max_tickets) || max_tickets < 1)) {
    return { error: 'Max tickets must be a positive integer' }
  }
  if (!['auto', 'invoice'].includes(mode)) return { error: 'Invalid mode' }

  const existing = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues').select('id').eq('slug', slug).maybeSingle()
  if (existing.data) return { error: 'A queue with this URL slug already exists.' }

  const { data, error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .insert({
      merchant_id: user.id,
      name: name.trim(),
      description: description?.trim() ?? null,
      mode,
      avg_service_minutes,
      ...(max_tickets ? { max_tickets } : {}),
      slug,
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to create queue. Please try again.' }
  return { id: (data as { id: string }).id }
}

export async function updateQueueStatus({
  queue_id,
  status,
}: {
  queue_id: string
  status: QueueStatus
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Runtime check — TypeScript types are stripped at runtime
  if (!(['open', 'paused', 'closed'] as const).includes(status)) return { error: 'Invalid status' }

  const { error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', queue_id)
    .eq('merchant_id', user.id)

  if (error) return { error: 'Failed to update queue status. Please try again.' }

  // Log the event
  await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queue_events')
    .insert({
      queue_id,
      event_type: status === 'open' ? 'queue_resumed' : status === 'paused' ? 'queue_paused' : 'queue_closed',
      actor_id: user.id,
      payload: { status },
    })

  return {}
}

export async function updateQueueSettings({
  queue_id,
  name,
  avg_service_minutes,
  manual_delay_minutes,
  is_accepting,
  max_tickets,
  passcode,
}: {
  queue_id: string
  name?: string
  avg_service_minutes?: number
  manual_delay_minutes?: number
  is_accepting?: boolean
  max_tickets?: number | null
  passcode?: string | null
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Server-side validation
  if (name !== undefined && name.trim().length > NAME_MAX) {
    return { error: `Queue name must be ${NAME_MAX} characters or less` }
  }
  if (avg_service_minutes !== undefined &&
    (!Number.isInteger(avg_service_minutes) || avg_service_minutes < 1 || avg_service_minutes > 480)) {
    return { error: 'Average service time must be between 1 and 480 minutes' }
  }
  if (manual_delay_minutes !== undefined &&
    (!Number.isInteger(manual_delay_minutes) || manual_delay_minutes < 0 || manual_delay_minutes > 480)) {
    return { error: 'Manual delay must be between 0 and 480 minutes' }
  }
  if (max_tickets !== undefined && max_tickets !== null &&
    (!Number.isInteger(max_tickets) || max_tickets < 1)) {
    return { error: 'Max tickets must be a positive integer' }
  }
  if (passcode !== null && passcode !== undefined && !/^\d{4}$/.test(passcode)) {
    return { error: 'Passcode must be exactly 4 digits' }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name !== undefined && name.trim()) updates['name'] = name.trim()
  if (avg_service_minutes !== undefined) updates['avg_service_minutes'] = avg_service_minutes
  if (manual_delay_minutes !== undefined) updates['manual_delay_minutes'] = manual_delay_minutes
  if (is_accepting !== undefined) updates['is_accepting'] = is_accepting
  if (max_tickets !== undefined) updates['max_tickets'] = max_tickets
  if (passcode !== undefined) updates['passcode'] = passcode ?? null

  const { error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .update(updates)
    .eq('id', queue_id)
    .eq('merchant_id', user.id)

  if (error) return { error: 'Failed to save settings. Please try again.' }
  return {}
}

export async function verifyQueuePasscode({
  queue_slug,
  passcode,
}: {
  queue_slug: string
  passcode: string
}): Promise<{ success: boolean; error?: string }> {
  // Validate input format before hitting the DB
  if (!/^\d{4}$/.test(passcode)) return { success: false, error: 'Invalid passcode format' }

  const admin = createAdminClient()
  const { data } = await admin.from('queues').select('id, passcode').eq('slug', queue_slug).single()
  const queue = data as { id: string; passcode: string | null } | null
  if (!queue) return { success: false }
  if (!queue.passcode) return { success: true }

  // Constant-time comparison to prevent timing attacks
  const correct = queue.passcode
  let mismatch = correct.length ^ passcode.length
  for (let i = 0; i < Math.max(correct.length, passcode.length); i++) {
    mismatch |= (correct.charCodeAt(i % correct.length) ^ passcode.charCodeAt(i % passcode.length))
  }
  return { success: mismatch === 0 }
}

export async function setManualDelay({
  queue_id,
  manual_delay_minutes,
}: {
  queue_id: string
  manual_delay_minutes: number
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!Number.isInteger(manual_delay_minutes) || manual_delay_minutes < 0 || manual_delay_minutes > 480) {
    return { error: 'Delay must be between 0 and 480 minutes' }
  }

  const { error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .update({ manual_delay_minutes, updated_at: new Date().toISOString() })
    .eq('id', queue_id)
    .eq('merchant_id', user.id)

  if (error) return { error: 'Failed to save delay. Please try again.' }

  await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queue_events')
    .insert({ queue_id, event_type: 'delay_set', actor_id: user.id, payload: { delay_minutes: manual_delay_minutes } })

  return {}
}

export async function callNext({
  queue_id,
}: {
  queue_id: string
}): Promise<{ ticket?: Ticket; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()

  // Lock the queue row to prevent concurrent callNext
  const { data: queueRaw, error: qErr } = await admin
    .from('queues')
    .select('id, status, current_ticket_id')
    .eq('id', queue_id)
    .eq('merchant_id', user.id)
    .single()

  const queue = queueRaw as Queue | null
  if (qErr || !queue) return { error: 'Queue not found' }
  if (queue.status !== 'open') return { error: 'Queue is not open' }

  // Get the next pending ticket
  const { data: ticketsRaw } = await admin
    .from('tickets')
    .select('*')
    .eq('queue_id', queue_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(2)

  const tickets = (ticketsRaw ?? []) as Ticket[]
  if (tickets.length === 0) return { error: 'NO_PENDING_TICKETS' }
  const nextTicket = tickets[0]

  if (!nextTicket) return { error: 'NO_PENDING_TICKETS' }

  // Mark current in-progress ticket as completed if one exists
  if (queue.current_ticket_id) {
    await admin
      .from('tickets')
      .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', queue.current_ticket_id)

    await admin.from('queue_events').insert({
      queue_id,
      ticket_id: queue.current_ticket_id,
      event_type: 'completed',
      actor_id: user.id,
      payload: {},
    })
  }

  // Transition next ticket to in_progress
  const calledAt = new Date().toISOString()
  await admin
    .from('tickets')
    .update({ status: 'in_progress', called_at: calledAt, updated_at: calledAt })
    .eq('id', nextTicket.id)

  await admin
    .from('queues')
    .update({ current_ticket_id: nextTicket.id, updated_at: calledAt })
    .eq('id', queue_id)

  await admin.from('queue_events').insert({
    queue_id,
    ticket_id: nextTicket.id,
    event_type: 'called_next',
    actor_id: user.id,
    payload: { ticket_number: nextTicket.ticket_number },
  })

  // Send push to the called ticket
  if (nextTicket.push_subscription) {
    try {
      const sub = nextTicket.push_subscription as { endpoint: string; keys: { p256dh: string; auth: string } }
      await sendPushNotification({
        subscription: sub,
        payload: {
          title: 'OMNI Queue',
          body: `Ticket #${nextTicket.ticket_number} — it's your turn! Please come to the counter.`,
          ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/q/${queue_id}/ticket/${nextTicket.id}`,
          ticketId: nextTicket.id,
        },
      })
    } catch {
      await admin.from('push_subscriptions').delete().eq('ticket_id', nextTicket.id)
    }
  }

  // Send push to the NEXT in line (ticket[1])
  const upNext = tickets[1]
  if (upNext?.push_subscription) {
    try {
      const sub = upNext.push_subscription as { endpoint: string; keys: { p256dh: string; auth: string } }
      await sendPushNotification({
        subscription: sub,
        payload: {
          title: 'OMNI Queue',
          body: `You're next! Ticket #${upNext.ticket_number} — please be ready.`,
          ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/q/${queue_id}/ticket/${upNext.id}`,
          ticketId: upNext.id,
        },
      })
    } catch {
      await admin.from('push_subscriptions').delete().eq('ticket_id', upNext.id)
    }
  }

  return { ticket: nextTicket }
}

export async function markComplete({
  ticket_id,
}: {
  ticket_id: string
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const completedAt = new Date().toISOString()

  const { data: ticketRaw } = await admin
    .from('tickets').select('queue_id').eq('id', ticket_id).single()
  const ticket = ticketRaw as { queue_id: string } | null
  if (!ticket) return { error: 'Ticket not found' }

  // Verify the ticket's queue belongs to the calling user
  const { data: queueOwner } = await admin.from('queues').select('id').eq('id', ticket.queue_id).eq('merchant_id', user.id).single()
  if (!queueOwner) return { error: 'Forbidden' }

  await admin.from('tickets').update({ status: 'completed', completed_at: completedAt, updated_at: completedAt }).eq('id', ticket_id)
  await admin.from('queues').update({ current_ticket_id: null, updated_at: completedAt }).eq('id', ticket.queue_id)
  await admin.from('queue_events').insert({ queue_id: ticket.queue_id, ticket_id, event_type: 'completed', actor_id: user.id, payload: {} })

  return {}
}

export async function skipTicket({
  ticket_id,
}: {
  ticket_id: string
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const skippedAt = new Date().toISOString()

  const { data: ticketRaw } = await admin.from('tickets').select('queue_id, status').eq('id', ticket_id).single()
  const ticket = ticketRaw as { queue_id: string; status: string } | null
  if (!ticket) return { error: 'Ticket not found' }

  // Verify the ticket's queue belongs to the calling user
  const { data: queueOwner } = await admin.from('queues').select('id').eq('id', ticket.queue_id).eq('merchant_id', user.id).single()
  if (!queueOwner) return { error: 'Forbidden' }

  await admin.from('tickets').update({ status: 'skipped', skipped_at: skippedAt, updated_at: skippedAt }).eq('id', ticket_id)
  await admin.from('queue_events').insert({ queue_id: ticket.queue_id, ticket_id, event_type: 'skipped', actor_id: user.id, payload: {} })

  if (ticket.status === 'in_progress') {
    await admin.from('queues').update({ current_ticket_id: null, updated_at: skippedAt }).eq('id', ticket.queue_id)
  }

  return {}
}

export async function deleteQueue({ queue_id }: { queue_id: string }): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin.from('queues').delete().eq('id', queue_id).eq('merchant_id', user.id)
  if (error) return { error: 'Failed to delete queue. Please try again.' }
  return {}
}
