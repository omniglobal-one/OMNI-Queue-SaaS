import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge, Button, EmptyState, StatRow } from '@omni/ui'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import type { Profile, Queue, Ticket } from '@/types'

function QueueStatusBadge({ status }: { status: string }) {
  if (status === 'open') return <Badge tone="success">Open</Badge>
  if (status === 'paused') return <Badge tone="warning">Paused</Badge>
  return <Badge tone="info">Closed</Badge>
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile) redirect('/login')
  if (profile.role === 'admin') redirect('/admin')

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
    <>
      <Topbar
        title="Dashboard"
        {...(profile.business_name ? { subtitle: profile.business_name } : {})}
        actions={
          <Button asChild>
            <Link href="/dashboard/queues/new">+ New Queue</Link>
          </Button>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <StatRow
          stats={[
            { label: 'Active queues', value: String(queues.filter(q => q.status === 'open').length) },
            { label: 'Waiting now', value: String(totalPending) },
            { label: 'Served today', value: String(totalServedToday) },
          ]}
        />

        <div className="rounded-md border border-omni-border bg-omni-surface">
          <div className="flex items-center justify-between border-b border-omni-border p-4">
            <h2 className="font-display text-h2 font-semibold text-omni-ink">Your Queues</h2>
            <Link href="/dashboard/queues" className="text-small text-accent hover:underline">View all</Link>
          </div>
          {queues.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No queues yet"
                description="Create your first queue to start managing walk-ins."
                action={<Button asChild><Link href="/dashboard/queues/new">Create your first queue</Link></Button>}
              />
            </div>
          ) : (
            <div className="divide-y divide-omni-border">
              {queues.map(q => (
                <Link
                  key={q.id}
                  href={`/dashboard/queues/${q.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-omni-surface-sunk"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-omni-ink">{q.name}</p>
                    <p className="mt-0.5 font-mono text-caption text-omni-ink-faint">/{q.slug}</p>
                  </div>
                  <QueueStatusBadge status={q.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
