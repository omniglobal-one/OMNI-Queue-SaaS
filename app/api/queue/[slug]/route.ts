import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Queue, Ticket } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: queueRaw } = await admin.from('queues').select('*').eq('slug', slug).single()
  const queue = queueRaw as Queue | null
  if (!queue) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { count: pendingCount } = await admin
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('queue_id', queue.id)
    .eq('status', 'pending')

  const { data: currentRaw } = queue.current_ticket_id
    ? await admin.from('tickets').select('ticket_number, customer_name').eq('id', queue.current_ticket_id).single()
    : { data: null }

  return NextResponse.json({
    id: queue.id,
    name: queue.name,
    status: queue.status,
    mode: queue.mode,
    is_accepting: queue.is_accepting,
    pending_count: pendingCount ?? 0,
    avg_service_minutes: queue.avg_service_minutes,
    manual_delay_minutes: queue.manual_delay_minutes,
    current_ticket: currentRaw,
  })
}
