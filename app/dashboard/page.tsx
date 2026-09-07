import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, ArrowUpRight } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { QueueStatusBadge } from '@/components/dashboard/StatusBadges'
import type { Profile, Queue, Ticket } from '@/types'

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

  const stats = [
    { label: 'Active queues', value: queues.filter(q => q.status === 'open').length },
    { label: 'Waiting now', value: totalPending },
    { label: 'Served today', value: totalServedToday },
  ]

  return (
    <>
      <Topbar
        title="Dashboard"
        {...(profile.business_name ? { subtitle: profile.business_name } : {})}
        actions={
          <Button asChild>
            <Link href="/dashboard/queues/new">
              <Plus className="size-4" /> New Queue
            </Link>
          </Button>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/70">
            <CardTitle className="text-base">Your Queues</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/dashboard/queues">
                View all <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          {queues.length === 0 ? (
            <EmptyState
              title="No queues yet"
              subtitle="Create your first queue to start managing walk-ins."
              ctaLabel="Create your first queue"
              ctaHref="/dashboard/queues/new"
            />
          ) : (
            <div className="divide-y divide-border/70">
              {queues.map(q => (
                <Link
                  key={q.id}
                  href={`/dashboard/queues/${q.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{q.name}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">/{q.slug}</p>
                  </div>
                  <QueueStatusBadge status={q.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
