'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { QueueStatusBadge } from '@/components/ui/Badge'
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
        if (result.error !== 'NO_PENDING_TICKETS') setCallError(result.error)
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
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">{queue.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <QueueStatusBadge status={queue.status} />
            <span className="text-xs text-text-tertiary mono">/{queue.slug}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {queue.status !== 'closed' && (
            <Button
              variant={queue.status === 'open' ? 'ghost' : 'success'}
              onClick={handleStatusToggle}
              loading={isPending}
            >
              {queue.status === 'open' ? 'Pause' : 'Resume'}
            </Button>
          )}
          {queue.status !== 'closed' && (
            <Button variant="danger" onClick={handleClose} loading={isPending}>
              Close Queue
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={handleCallNext}
          loading={isPending}
          disabled={queue.status !== 'open'}
          className="flex-1"
        >
          Call Next
        </Button>
      </div>

      {callError && (
        <p className="text-danger text-sm">{callError}</p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-bg-border">
        <label className="text-sm text-text-secondary whitespace-nowrap">Extra delay</label>
        <input
          type="number"
          min={0}
          value={delayInput}
          onChange={e => setDelayInput(e.target.value)}
          className="input w-20 text-center"
        />
        <span className="text-sm text-text-tertiary">mins</span>
        <Button variant="ghost" onClick={handleDelaySave} loading={isPending} className="h-9 px-3">
          Save
        </Button>
      </div>
    </div>
  )
}
