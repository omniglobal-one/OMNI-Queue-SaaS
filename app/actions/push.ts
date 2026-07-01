'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function subscribeToPush({
  ticket_id,
  queue_id,
  subscription,
}: {
  ticket_id: string
  queue_id: string
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
}): Promise<{ error?: string }> {
  const admin = createAdminClient()

  // Verify ticket is active and belongs to the claimed queue before storing subscription
  const { data: ticketRaw } = await admin
    .from('tickets')
    .select('status, queue_id')
    .eq('id', ticket_id)
    .single()
  const ticket = ticketRaw as { status: string; queue_id: string } | null
  if (!ticket) return { error: 'Ticket not found' }
  if (ticket.queue_id !== queue_id) return { error: 'Queue mismatch' }
  if (ticket.status === 'completed' || ticket.status === 'skipped') {
    return { error: 'Ticket is no longer active' }
  }

  // Validate subscription shape and field lengths
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { error: 'Invalid subscription data' }
  }
  if (subscription.endpoint.length > 2048 || subscription.keys.p256dh.length > 200 || subscription.keys.auth.length > 100) {
    return { error: 'Invalid subscription data' }
  }

  await admin.from('push_subscriptions').upsert(
    {
      ticket_id,
      queue_id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'ticket_id' }
  )

  await admin
    .from('tickets')
    .update({ push_subscription: subscription, updated_at: new Date().toISOString() })
    .eq('id', ticket_id)

  return {}
}

export async function unsubscribeFromPush({ ticket_id }: { ticket_id: string }): Promise<{ error?: string }> {
  const admin = createAdminClient()

  // Verify ticket exists before attempting unsubscribe
  const { data: ticketRaw } = await admin.from('tickets').select('id').eq('id', ticket_id).single()
  if (!ticketRaw) return { error: 'Ticket not found' }

  await admin.from('push_subscriptions').delete().eq('ticket_id', ticket_id)
  await admin.from('tickets').update({ push_subscription: null }).eq('id', ticket_id)
  return {}
}
