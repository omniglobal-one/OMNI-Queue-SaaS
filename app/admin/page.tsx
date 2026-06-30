import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { QueueStatusBadge } from '@/components/ui/Badge'
import type { Profile, Queue } from '@/types'

interface TicketCounts {
  queue_id: string
  pending: number
  in_progress: number
  completed: number
  skipped: number
  total: number
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const role = (profileRaw as { role: string } | null)?.role
  if (role !== 'admin') redirect('/dashboard')

  // Fetch all data in parallel
  const [profilesRes, queuesRes, ticketsRes, authUsersRes] = await Promise.all([
    admin.from('profiles').select('*').order('created_at'),
    admin.from('queues').select('*').order('created_at', { ascending: false }),
    admin.from('tickets').select('queue_id, status'),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ])

  const profiles = (profilesRes.data ?? []) as Profile[]
  const queues = (queuesRes.data ?? []) as Queue[]
  const tickets = (ticketsRes.data ?? []) as { queue_id: string; status: string }[]
  const authUsers = authUsersRes.data?.users ?? []

  // Build email map
  const emailMap = new Map<string, string>(authUsers.map(u => [u.id, u.email ?? '']))

  // Build ticket counts per queue
  const ticketCountMap = new Map<string, TicketCounts>()
  for (const t of tickets) {
    const existing = ticketCountMap.get(t.queue_id) ?? {
      queue_id: t.queue_id, pending: 0, in_progress: 0, completed: 0, skipped: 0, total: 0,
    }
    existing.total++
    if (t.status === 'pending') existing.pending++
    else if (t.status === 'in_progress') existing.in_progress++
    else if (t.status === 'completed') existing.completed++
    else if (t.status === 'skipped') existing.skipped++
    ticketCountMap.set(t.queue_id, existing)
  }

  // Build per-merchant queue count
  const merchantQueueCount = new Map<string, number>()
  for (const q of queues) {
    merchantQueueCount.set(q.merchant_id, (merchantQueueCount.get(q.merchant_id) ?? 0) + 1)
  }

  // Stats
  const totalMerchants = profiles.filter(p => p.role === 'merchant').length
  const activeMerchants = profiles.filter(p => p.role === 'merchant' && p.is_active).length
  const openQueues = queues.filter(q => q.status === 'open').length
  const totalPending = tickets.filter(t => t.status === 'pending').length
  const totalServed = tickets.filter(t => t.status === 'completed').length

  return (
    <>
      <Topbar title="Admin Panel" subtitle="Platform overview" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Merchants', value: `${activeMerchants} / ${totalMerchants}`, sub: 'active / total' },
            { label: 'Open Queues', value: openQueues, sub: `${queues.length} total` },
            { label: 'Waiting Now', value: totalPending, sub: 'across all queues' },
            { label: 'Total Served', value: totalServed, sub: 'all time' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs text-text-tertiary">{s.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{s.value}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Merchants */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Merchants</h2>
              <p className="text-xs text-text-tertiary mt-0.5">{profiles.length} accounts</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-base">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Business</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Email</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Role</th>
                  <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Queues</th>
                  <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Status</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-text-tertiary">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/60">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-text-primary">{p.business_name ?? <span className="text-text-tertiary italic">No name</span>}</p>
                      {p.business_slug && <p className="text-xs text-text-tertiary font-mono">/{p.business_slug}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-text-secondary text-xs font-mono">{emailMap.get(p.id) ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-bg-border text-text-secondary'}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-semibold text-text-primary">
                        {merchantQueueCount.get(p.id) ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? 'bg-success/10 text-success' : 'bg-bg-border text-text-tertiary'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs text-text-tertiary">
                        {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Queues */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border">
            <h2 className="text-base font-semibold text-text-primary">All Queues</h2>
            <p className="text-xs text-text-tertiary mt-0.5">{queues.length} queues across all merchants</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-base">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Queue</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Merchant</th>
                  <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Mode</th>
                  <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Status</th>
                  <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Waiting</th>
                  <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Served</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-text-tertiary">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/60">
                {queues.map(q => {
                  const counts = ticketCountMap.get(q.id)
                  const merchant = profiles.find(p => p.id === q.merchant_id)
                  return (
                    <tr key={q.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-text-primary">{q.name}</p>
                        <p className="text-xs text-text-tertiary font-mono">/q/{q.slug}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-text-secondary">{merchant?.business_name ?? '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-mono text-text-tertiary">{q.mode}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <QueueStatusBadge status={q.status} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-sm font-bold ${(counts?.pending ?? 0) > 0 ? 'text-primary' : 'text-text-tertiary'}`}>
                          {counts?.pending ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-sm text-success font-medium">{counts?.completed ?? 0}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-text-secondary">{counts?.total ?? 0}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  )
}
