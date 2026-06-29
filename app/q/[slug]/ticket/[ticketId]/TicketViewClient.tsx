'use client'

import Link from 'next/link'
import { useQueueRealtime } from '@/hooks/useQueueRealtime'
import { StatusCard } from '@/components/customer/StatusCard'
import { PushPrompt } from '@/components/customer/PushPrompt'
import { PhoneAddForm } from '@/components/customer/PhoneAddForm'
import { ReconnectBanner } from '@/components/customer/ReconnectBanner'
import { PLATFORM } from '@/lib/platform-info'
import type { Ticket, Queue } from '@/types'

export function TicketViewClient({
  initialTicket,
  initialQueue,
  initialPosition,
  initialPendingAhead,
}: {
  initialTicket: Ticket
  initialQueue: Queue
  initialPosition: number
  initialPendingAhead: number
}) {
  const { ticket, queue, livePosition, pendingAhead, isConnected } = useQueueRealtime({
    ticketId: initialTicket.id,
    queueId: initialQueue.id,
    initialTicket,
    initialQueue,
    initialPosition,
    initialPendingAhead,
  })

  if (!ticket || !queue) return null

  const isActive = ticket.status === 'pending' || ticket.status === 'in_progress'

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="h-14 bg-bg-card border-b border-bg-border flex items-center justify-between px-4">
        <Link href={`/q/${queue.slug}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-text-primary text-sm">{PLATFORM.name}</span>
        </Link>
        {isActive && (
          <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-success' : 'text-text-tertiary'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-text-tertiary'}`} />
            {isConnected ? 'Live' : 'Connecting…'}
          </div>
        )}
      </header>

      <div className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-4">
        <ReconnectBanner isConnected={isConnected} />
        <StatusCard
          ticket={ticket}
          queue={queue}
          livePosition={livePosition}
          pendingAhead={pendingAhead}
        />

        {isActive && (
          <>
            <PushPrompt
              ticketId={ticket.id}
              queueId={queue.id}
              alreadySubscribed={!!ticket.push_subscription}
            />
            <PhoneAddForm ticketId={ticket.id} currentPhone={ticket.customer_phone} />
          </>
        )}

        <div className="text-center">
          <p className="text-xs text-text-tertiary">Keep this page open to track your position in real time.</p>
          <p className="text-xs text-text-tertiary mt-1">Ticket ID: <span className="mono">{ticket.id.slice(0, 8)}…</span></p>
        </div>
      </div>
    </div>
  )
}
