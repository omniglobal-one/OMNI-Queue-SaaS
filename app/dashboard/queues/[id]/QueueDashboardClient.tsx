'use client'

import Link from 'next/link'
import { useMerchantQueueRealtime } from '@/hooks/useMerchantQueueRealtime'
import { Topbar } from '@/components/layout/Topbar'
import { QueueControls } from '@/components/merchant/QueueControls'
import { CurrentlyServing } from '@/components/merchant/CurrentlyServing'
import { TicketRow } from '@/components/merchant/TicketRow'
import { TodayStats } from '@/components/merchant/TodayStats'
import { QRCodeCard } from '@/components/merchant/QRCodeCard'
import { ReconnectBanner } from '@/components/customer/ReconnectBanner'
import type { Queue, Ticket } from '@/types'

export function QueueDashboardClient({
  initialQueue,
  initialTickets,
}: {
  initialQueue: Queue
  initialTickets: Ticket[]
}) {
  const { queue, tickets, isConnected } = useMerchantQueueRealtime({ initialQueue, initialTickets })

  const currentTicket = tickets.find(t => t.id === queue.current_ticket_id) ?? null
  const pendingTickets = tickets.filter(t => t.status === 'pending')
  const recentDone = tickets.filter(t => t.status === 'completed' || t.status === 'skipped').slice(-10).reverse()

  return (
    <>
      <Topbar
        title={queue.name}
        subtitle="Queue dashboard"
        actions={
          <div className="flex items-center gap-3">
            <ReconnectBanner isConnected={isConnected} />
            <Link href={`/dashboard/queues/${queue.id}/settings`} className="btn-ghost h-9 text-sm">
              Settings
            </Link>
          </div>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex flex-col gap-4">
            <TodayStats tickets={tickets} queue={queue} />
            <QueueControls queue={queue} />
            <CurrentlyServing ticket={currentTicket} />

            <div className="card">
              <div className="p-4 border-b border-bg-border">
                <h2 className="section-header mb-0">Waiting ({pendingTickets.length})</h2>
              </div>
              {pendingTickets.length === 0 ? (
                <p className="p-6 text-center text-text-tertiary text-sm">No one waiting</p>
              ) : (
                <div>
                  {pendingTickets.map((t, i) => (
                    <TicketRow key={t.id} ticket={t} queue={queue} position={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {recentDone.length > 0 && (
              <div className="card">
                <div className="p-4 border-b border-bg-border">
                  <h2 className="section-header mb-0">Recent</h2>
                </div>
                <div>
                  {recentDone.map((t, i) => (
                    <TicketRow key={t.id} ticket={t} queue={queue} position={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <QRCodeCard slug={queue.slug} queueName={queue.name} />
          </div>
        </div>
      </div>
    </>
  )
}
