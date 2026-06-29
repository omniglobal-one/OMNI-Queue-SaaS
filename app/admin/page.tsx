import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { QueueStatusBadge } from '@/components/ui/Badge'
import type { Profile, Queue } from '@/types'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const role = (profileRaw as { role: string } | null)?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: profilesRaw } = await admin.from('profiles').select('*').order('created_at')
  const profiles = (profilesRaw ?? []) as Profile[]

  const { data: queuesRaw } = await admin.from('queues').select('*').order('created_at', { ascending: false }).limit(20)
  const queues = (queuesRaw ?? []) as Queue[]

  return (
    <>
      <Topbar
        title="Admin Panel"
        subtitle={`${profiles.length} merchants · ${queues.length} queues`}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="p-4 border-b border-bg-border">
              <h2 className="section-header mb-0">Merchants ({profiles.length})</h2>
            </div>
            <div className="divide-y divide-bg-border">
              {profiles.map(p => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{p.business_name ?? 'No name'}</p>
                    <p className="text-xs text-text-tertiary capitalize">{p.role}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.is_active ? 'badge-success' : 'badge-neutral'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-bg-border">
              <h2 className="section-header mb-0">Recent Queues</h2>
            </div>
            <div className="divide-y divide-bg-border">
              {queues.map(q => (
                <div key={q.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{q.name}</p>
                    <p className="text-xs text-text-tertiary mono">/{q.slug}</p>
                  </div>
                  <QueueStatusBadge status={q.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
