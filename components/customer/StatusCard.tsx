import { formatWaitTime } from '@/lib/wait-time'
import type { Ticket, Queue } from '@/types'

export function StatusCard({
  ticket,
  queue,
  livePosition,
  pendingAhead,
}: {
  ticket: Ticket
  queue: Queue
  livePosition: number
  pendingAhead: number
}) {
  const isNext = pendingAhead === 0 && ticket.status === 'pending'
  const isCalled = ticket.status === 'in_progress'
  const isCompleted = ticket.status === 'completed'
  const isSkipped = ticket.status === 'skipped'

  const waitMinutes = isCalled || isCompleted ? 0 : pendingAhead * queue.avg_service_minutes + queue.manual_delay_minutes

  return (
    <div className={`card p-8 text-center ${isCalled ? 'border-primary/40 shadow-glow' : ''}`}>
      <div className="mb-6">
        {isCalled && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            It&apos;s Your Turn!
          </div>
        )}
        {isNext && !isCalled && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full mb-4">
            You&apos;re Next
          </div>
        )}
        {queue.status === 'paused' && ticket.status === 'pending' && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full mb-4">
            Queue Paused
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-text-tertiary text-sm mb-1">Your Ticket</p>
        <p className="text-6xl font-bold text-primary">#{ticket.ticket_number}</p>
      </div>

      {ticket.invoice_number && (
        <p className="text-text-secondary text-sm mb-6">Invoice #{ticket.invoice_number}</p>
      )}

      {ticket.status === 'pending' && (
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">{livePosition}</p>
            <p className="text-xs text-text-tertiary mt-1">Position</p>
          </div>
          <div className="w-px bg-bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">{formatWaitTime(waitMinutes)}</p>
            <p className="text-xs text-text-tertiary mt-1">Est. Wait</p>
          </div>
        </div>
      )}

      {isCalled && (
        <p className="text-text-secondary mt-6">Please proceed to the counter now.</p>
      )}

      {isCompleted && (
        <div className="mt-6">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="text-success" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-success font-medium">Service Completed</p>
          <p className="text-text-tertiary text-sm mt-1">Thank you for visiting {queue.name}!</p>
        </div>
      )}

      {isSkipped && (
        <div className="mt-6">
          <p className="text-danger font-medium">Ticket Skipped</p>
          <p className="text-text-tertiary text-sm mt-1">Please speak to a staff member for assistance.</p>
        </div>
      )}
    </div>
  )
}
