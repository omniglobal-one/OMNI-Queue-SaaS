import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/push'

export async function POST(req: NextRequest) {
  // Require authenticated merchant
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { ticket_id?: string; title?: string; body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { ticket_id, title, body: msgBody } = body

  if (!ticket_id || typeof title !== 'string' || typeof msgBody !== 'string') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (title.length > 200 || msgBody.length > 1000) {
    return NextResponse.json({ error: 'Field too long' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: ticketRaw } = await admin
    .from('tickets')
    .select('id, queue_id, ticket_number, push_subscription')
    .eq('id', ticket_id)
    .single()

  const ticket = ticketRaw as {
    id: string; queue_id: string; ticket_number: string; push_subscription: unknown
  } | null

  if (!ticket || !ticket.push_subscription) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  // Verify the user owns this queue or is admin
  const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = (profileRaw as { role: string } | null)?.role === 'admin'

  const { data: queueRaw } = await admin.from('queues').select('merchant_id').eq('id', ticket.queue_id).single()
  const queue = queueRaw as { merchant_id: string } | null
  if (!isAdmin && (!queue || queue.merchant_id !== user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const sub = ticket.push_subscription as { endpoint: string; keys: { p256dh: string; auth: string } }
    await sendPushNotification({
      subscription: sub,
      payload: {
        title,
        body: msgBody,
        ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/q/${ticket.queue_id}/ticket/${ticket.id}`,
        ticketId: ticket.id,
      },
    })
    return NextResponse.json({ ok: true })
  } catch {
    await admin.from('push_subscriptions').delete().eq('ticket_id', ticket_id)
    return NextResponse.json({ error: 'Push delivery failed' }, { status: 422 })
  }
}
