'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import type { Queue, Ticket, QueueStatus } from '@/types'

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

  const existing = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues').select('id').eq('slug', slug).maybeSingle()
  if (existing.data) return { error: 'A queue with this URL slug already exists.' }

  const { data, error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .insert({
      merchant_id: user.id,
      name,
      description: description ?? null,
      mode,
      avg_service_minutes,
      ...(max_tickets ? { max_tickets } : {}),
      slug,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
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

  const { error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', queue_id)
    .eq('merchant_id', user.id)

  if (error) return { error: error.message }

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
  avg_service_minutes,
  manual_delay_minutes,
  is_accepting,
  max_tickets,
}: {
  queue_id: string
  avg_service_minutes?: number
  manual_delay_minutes?: number
  is_accepting?: boolean
  max_tickets?: number | null
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (avg_service_minutes !== undefined) updates['avg_service_minutes'] = avg_service_minutes
  if (manual_delay_minutes !== undefined) updates['manual_delay_minutes'] = manual_delay_minutes
  if (is_accepting !== undefined) updates['is_accepting'] = is_accepting
  if (max_tickets !== undefined) updates['max_tickets'] = max_tickets

  const { error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .update(updates)
    .eq('id', queue_id)
    .eq('merchant_id', user.id)

  if (error) return { error: error.message }
  return {}
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

  const { error } = await (supabase as unknown as ReturnType<typeof createAdminClient>)
    .from('queues')
    .update({ manual_delay_minutes, updated_at: new Date().toISOString() })
    .eq('id', queue_id)
    .eq('merchant_id', user.id)

  if (error) return { error: error.message }

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
  if (error) return { error: error.message }
  return {}
}
