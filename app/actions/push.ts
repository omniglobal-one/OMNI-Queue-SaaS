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
  await admin.from('push_subscriptions').delete().eq('ticket_id', ticket_id)
  await admin.from('tickets').update({ push_subscription: null }).eq('id', ticket_id)
  return {}
}
