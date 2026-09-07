import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
    <Card className={cn('text-center', isCalled && 'border-primary/40')}>
      <CardContent className="p-8">
        <div className="mb-6">
          {isCalled && (
            <Badge className="mb-4 gap-1.5 animate-pulse">
              <span className="size-2 rounded-full bg-primary-foreground" />
              It&apos;s Your Turn!
            </Badge>
          )}
          {isNext && !isCalled && (
            <Badge variant="secondary" className="mb-4">You&apos;re Next</Badge>
          )}
          {queue.status === 'paused' && ticket.status === 'pending' && (
            <Badge variant="warning" className="mb-4">Queue Paused</Badge>
          )}
        </div>

        <div className="mb-2">
          <p className="mb-1 text-sm text-muted-foreground">Your Ticket</p>
          <p className="text-6xl font-bold text-primary">#{ticket.ticket_number}</p>
        </div>

        {ticket.invoice_number && (
          <p className="mb-6 text-sm text-muted-foreground">Invoice #{ticket.invoice_number}</p>
        )}

        {ticket.status === 'pending' && (
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{livePosition}</p>
              <p className="mt-1 text-xs text-muted-foreground">Position</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold">{formatWaitTime(waitMinutes)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Est. Wait</p>
            </div>
          </div>
        )}

        {isCalled && <p className="mt-6 text-muted-foreground">Please proceed to the counter now.</p>}

        {isCompleted && (
          <div className="mt-6">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/10">
              <Check className="size-6 text-success" strokeWidth={2} />
            </div>
            <p className="font-medium text-success">Service Completed</p>
            <p className="mt-1 text-sm text-muted-foreground">Thank you for visiting {queue.name}!</p>
          </div>
        )}

        {isSkipped && (
          <div className="mt-6">
            <p className="font-medium text-destructive">Ticket Skipped</p>
            <p className="mt-1 text-sm text-muted-foreground">Please speak to a staff member for assistance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
