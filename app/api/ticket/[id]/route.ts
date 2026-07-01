import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Ticket } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: ticketRaw } = await admin.from('tickets').select('*').eq('id', id).single()
  const ticket = ticketRaw as Ticket | null
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let livePosition = 0
  let pendingAhead = 0

  if (ticket.status === 'pending') {
    const { data: pendingRaw } = await admin
      .from('tickets')
      .select('id')
      .eq('queue_id', ticket.queue_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    const pending = (pendingRaw ?? []) as { id: string }[]
    const idx = pending.findIndex(t => t.id === id)
    if (idx >= 0) { livePosition = idx + 1; pendingAhead = idx }
  }

  // Strip sensitive fields before returning to unauthenticated callers.
  // push_subscription contains private browser crypto keys; customer_phone and
  // notes are merchant/PII data that customers don't need via this public API.
  const { push_subscription, customer_phone, notes, ...safeTicket } = ticket

  return NextResponse.json({ ...safeTicket, live_position: livePosition, pending_ahead: pendingAhead })
}
