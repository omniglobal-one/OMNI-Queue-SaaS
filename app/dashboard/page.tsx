import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StatCard } from '@/components/ui/StatCard'
import { QueueStatusBadge } from '@/components/ui/Badge'
import type { Profile, Queue, Ticket } from '@/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile) redirect('/login')

  const { data: queuesRaw } = await admin.from('queues').select('*').eq('merchant_id', user.id).order('created_at')
  const queues = (queuesRaw ?? []) as Queue[]

  const today = new Date().toDateString()
  let totalPending = 0
  let totalServedToday = 0

  const queueIds = queues.map(q => q.id)
  if (queueIds.length > 0) {
    const { data: ticketsRaw } = await admin.from('tickets').select('*').in('queue_id', queueIds)
    const tickets = (ticketsRaw ?? []) as Ticket[]
    totalPending = tickets.filter(t => t.status === 'pending').length
    totalServedToday = tickets.filter(t =>
      t.status === 'completed' && new Date(t.created_at).toDateString() === today
    ).length
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Dashboard</h1>
        <Link href="/dashboard/queues/new" className="btn-primary h-9 text-sm">
          + New Queue
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Queues" value={queues.filter(q => q.status === 'open').length} highlight />
        <StatCard label="Waiting Now" value={totalPending} />
        <StatCard label="Served Today" value={totalServedToday} />
      </div>

      <div className="card">
        <div className="p-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="section-header mb-0">Your Queues</h2>
          <Link href="/dashboard/queues" className="text-primary text-sm hover:underline">View all</Link>
        </div>
        {queues.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-tertiary mb-4">No queues yet.</p>
            <Link href="/dashboard/queues/new" className="btn-primary h-9 text-sm">
              Create your first queue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-bg-border">
            {queues.map(q => (
              <Link
                key={q.id}
                href={`/dashboard/queues/${q.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-bg-border/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary">{q.name}</p>
                  <p className="text-xs text-text-tertiary mono mt-0.5">/{q.slug}</p>
                </div>
                <QueueStatusBadge status={q.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
