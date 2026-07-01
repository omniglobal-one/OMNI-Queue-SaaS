import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { AdminClient } from './AdminClient'
import type { Profile, Queue } from '@/types'

interface TicketCounts {
  queue_id: string
  pending: number
  completed: number
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

  const emailMap: Record<string, string> = Object.fromEntries(authUsers.map(u => [u.id, u.email ?? '']))

  const ticketCountMap: Record<string, TicketCounts> = {}
  for (const t of tickets) {
    const c = ticketCountMap[t.queue_id] ?? { queue_id: t.queue_id, pending: 0, completed: 0, total: 0 }
    c.total++
    if (t.status === 'pending') c.pending++
    else if (t.status === 'completed') c.completed++
    ticketCountMap[t.queue_id] = c
  }

  const merchantQueueCount: Record<string, number> = {}
  for (const q of queues) {
    merchantQueueCount[q.merchant_id] = (merchantQueueCount[q.merchant_id] ?? 0) + 1
  }

  const totalMerchants = profiles.filter(p => p.role === 'merchant').length
  const activeMerchants = profiles.filter(p => p.role === 'merchant' && p.is_active).length
  const openQueues = queues.filter(q => q.status === 'open').length
  const totalPending = tickets.filter(t => t.status === 'pending').length
  const totalServed = tickets.filter(t => t.status === 'completed').length

  return (
    <>
      <Topbar title="Admin Panel" subtitle="Platform overview" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <AdminClient
          profiles={profiles}
          queues={queues}
          ticketCountMap={ticketCountMap}
          merchantQueueCount={merchantQueueCount}
          emailMap={emailMap}
          stats={{
            activeMerchants,
            totalMerchants,
            openQueues,
            totalPending,
            totalServed,
            totalQueues: queues.length,
          }}
        />
      </div>
    </>
  )
}
