'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { useMerchantQueueRealtime } from '@/hooks/useMerchantQueueRealtime'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { QueueControls } from '@/components/merchant/QueueControls'
import { CurrentlyServing } from '@/components/merchant/CurrentlyServing'
import { TicketRow } from '@/components/merchant/TicketRow'
import { TodayStats } from '@/components/merchant/TodayStats'
import { QRCodeCard } from '@/components/merchant/QRCodeCard'
import { ReconnectBanner } from '@/components/customer/ReconnectBanner'
import { EmptyState } from '@/components/dashboard/EmptyState'
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
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/queues/${queue.id}/settings`}>
                <Settings className="size-4" /> Settings
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <TodayStats tickets={tickets} queue={queue} />
            <QueueControls queue={queue} />
            <CurrentlyServing ticket={currentTicket} queue={queue} />

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/70 py-4">
                <CardTitle className="text-base">Waiting ({pendingTickets.length})</CardTitle>
              </CardHeader>
              {pendingTickets.length === 0 ? (
                <EmptyState title="No one waiting" subtitle="Customers will appear here when they join the queue." />
              ) : (
                <div>
                  {pendingTickets.map((t, i) => (
                    <TicketRow key={t.id} ticket={t} queue={queue} position={i + 1} />
                  ))}
                </div>
              )}
            </Card>

            {recentDone.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/70 py-4">
                  <CardTitle className="text-base">Recent</CardTitle>
                </CardHeader>
                <div>
                  {recentDone.map((t, i) => (
                    <TicketRow key={t.id} ticket={t} queue={queue} position={i + 1} />
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <QRCodeCard queueId={queue.id} slug={queue.slug} queueName={queue.name} />
          </div>
        </div>
      </div>
    </>
  )
}
