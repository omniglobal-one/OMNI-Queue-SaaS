'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { QueueStatusBadge } from '@/components/dashboard/StatusBadges'
import { updateQueueStatus, callNext, setManualDelay } from '@/app/actions/queues'
import type { Queue, Ticket } from '@/types'

export function QueueControls({
  queue,
  onTicketCalled,
}: {
  queue: Queue
  onTicketCalled?: (ticket: Ticket) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [delayInput, setDelayInput] = useState(String(queue.manual_delay_minutes))
  const [callError, setCallError] = useState<string | null>(null)

  function handleStatusToggle() {
    const newStatus = queue.status === 'open' ? 'paused' : 'open'
    startTransition(async () => {
      await updateQueueStatus({ queue_id: queue.id, status: newStatus })
    })
  }

  function handleClose() {
    startTransition(async () => {
      await updateQueueStatus({ queue_id: queue.id, status: 'closed' })
    })
  }

  function handleCallNext() {
    setCallError(null)
    startTransition(async () => {
      const result = await callNext({ queue_id: queue.id })
      if ('error' in result) {
        if (result.error !== 'NO_PENDING_TICKETS') setCallError(result.error ?? null)
      } else if (result.ticket) {
        onTicketCalled?.(result.ticket)
      }
    })
  }

  function handleDelaySave() {
    const val = parseInt(delayInput, 10)
    if (isNaN(val) || val < 0) return
    startTransition(async () => {
      await setManualDelay({ queue_id: queue.id, manual_delay_minutes: val })
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{queue.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <QueueStatusBadge status={queue.status} />
              <span className="font-mono text-xs text-muted-foreground">/{queue.slug}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {queue.status !== 'closed' && (
              <Button
                size="sm"
                variant={queue.status === 'open' ? 'outline' : 'default'}
                className={queue.status !== 'open' ? 'bg-success text-success-foreground hover:bg-success/90' : ''}
                onClick={handleStatusToggle}
                disabled={isPending}
              >
                {queue.status === 'open' ? 'Pause' : 'Resume'}
              </Button>
            )}
            {queue.status !== 'closed' && (
              <Button size="sm" variant="destructive" onClick={handleClose} disabled={isPending}>
                Close Queue
              </Button>
            )}
          </div>
        </div>

        <Button onClick={handleCallNext} disabled={isPending || queue.status !== 'open'} className="w-full">
          {isPending && <Loader2 className="size-4 animate-spin" />} Call Next
        </Button>

        {callError && <p className="text-sm text-destructive">{callError}</p>}

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <label className="whitespace-nowrap text-sm text-muted-foreground">Extra delay</label>
          <Input
            type="number"
            min={0}
            value={delayInput}
            onChange={e => setDelayInput(e.target.value)}
            className="w-20 text-center"
          />
          <span className="text-sm text-muted-foreground">mins</span>
          <Button variant="ghost" size="sm" onClick={handleDelaySave} disabled={isPending}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
