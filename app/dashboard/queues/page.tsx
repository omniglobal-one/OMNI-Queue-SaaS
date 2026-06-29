import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { QueueStatusBadge } from '@/components/ui/Badge'
import type { Queue } from '@/types'

export default async function QueuesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: queuesRaw } = await admin.from('queues').select('*').eq('merchant_id', user.id).order('created_at')
  const queues = (queuesRaw ?? []) as Queue[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Queues</h1>
        <Link href="/dashboard/queues/new" className="btn-primary h-9 text-sm">+ New Queue</Link>
      </div>

      {queues.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-tertiary mb-4">No queues yet. Create one to start accepting customers.</p>
          <Link href="/dashboard/queues/new" className="btn-primary h-10">Create your first queue</Link>
        </div>
      ) : (
        <div className="card divide-y divide-bg-border">
          {queues.map(q => (
            <Link
              key={q.id}
              href={`/dashboard/queues/${q.id}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-bg-border/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary">{q.name}</p>
                {q.description && <p className="text-sm text-text-tertiary truncate">{q.description}</p>}
                <p className="text-xs text-text-tertiary mono mt-0.5">omniqueue.app/q/{q.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <QueueStatusBadge status={q.status} />
                <svg className="text-text-tertiary" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
