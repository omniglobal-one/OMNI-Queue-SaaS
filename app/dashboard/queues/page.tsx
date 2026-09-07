import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, ChevronRight } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { QueueStatusBadge } from '@/components/dashboard/StatusBadges'
import type { Queue } from '@/types'

export default async function QueuesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if ((profileRaw as { role: string } | null)?.role === 'admin') redirect('/admin')

  const { data: queuesRaw } = await admin.from('queues').select('*').eq('merchant_id', user.id).order('created_at')
  const queues = (queuesRaw ?? []) as Queue[]

  return (
    <>
      <Topbar
        title="Queues"
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/queues/new">
              <Plus className="size-4" /> New Queue
            </Link>
          </Button>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          {queues.length === 0 ? (
            <EmptyState
              title="No queues yet"
              subtitle="Create a queue to start accepting customers."
              ctaLabel="Create your first queue"
              ctaHref="/dashboard/queues/new"
            />
          ) : (
            <div className="divide-y divide-border/70">
              {queues.map(q => (
                <Link
                  key={q.id}
                  href={`/dashboard/queues/${q.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{q.name}</p>
                    {q.description && <p className="truncate text-sm text-muted-foreground">{q.description}</p>}
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">queue.omnidesk.one/q/{q.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <QueueStatusBadge status={q.status} />
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
