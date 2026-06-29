import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

export async function POST(req: NextRequest) {
  const body = await req.json() as { ticket_id: string; title: string; body: string }
  const { ticket_id, title, body: msgBody } = body

  const admin = createAdminClient()
  const { data: ticketRaw } = await admin.from('tickets').select('id, queue_id, ticket_number, push_subscription').eq('id', ticket_id).single()
  const ticket = ticketRaw as { id: string; queue_id: string; ticket_number: string; push_subscription: unknown } | null

  if (!ticket || !ticket.push_subscription) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
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
    return NextResponse.json({ error: 'Push failed — subscription removed' }, { status: 422 })
  }
}
