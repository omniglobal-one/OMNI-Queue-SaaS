import { StatCard } from '@/components/ui/StatCard'
import type { Ticket, Queue } from '@/types'

export function TodayStats({ tickets, queue }: { tickets: Ticket[]; queue: Queue }) {
  const today = new Date().toDateString()
  const todayTickets = tickets.filter(t => new Date(t.created_at).toDateString() === today)
  const served = todayTickets.filter(t => t.status === 'completed').length
  const pending = tickets.filter(t => t.status === 'pending').length
  const skipped = todayTickets.filter(t => t.status === 'skipped').length

  const avgService = queue.avg_service_minutes
  const estimated = Math.max(0, pending * avgService + queue.manual_delay_minutes)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard label="Waiting" value={pending} highlight />
      <StatCard label="Served Today" value={served} />
      <StatCard label="Skipped" value={skipped} />
      <StatCard label="Est. Wait" value={`${estimated}m`} sub="for next person" />
    </div>
  )
}
