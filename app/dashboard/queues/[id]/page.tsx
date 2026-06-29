import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { QueueDashboardClient } from './QueueDashboardClient'
import type { Queue, Ticket } from '@/types'

export default async function QueueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: queueRaw } = await admin.from('queues').select('*').eq('id', id).eq('merchant_id', user.id).single()
  const queue = queueRaw as Queue | null
  if (!queue) notFound()

  const { data: ticketsRaw } = await admin
    .from('tickets')
    .select('*')
    .eq('queue_id', id)
    .order('created_at', { ascending: true })

  const tickets = (ticketsRaw ?? []) as Ticket[]

  return <QueueDashboardClient initialQueue={queue} initialTickets={tickets} />
}
