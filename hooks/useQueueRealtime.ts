'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getTicketWithPosition } from '@/app/actions/tickets'
import type { Ticket, Queue } from '@/types'

const POLL_INTERVAL_MS = 4000

export interface QueueRealtimeState {
  ticket: Ticket | null
  queue: Queue | null
  livePosition: number
  pendingAhead: number
  isConnected: boolean
}

// Polls the existing getTicketWithPosition server action instead of subscribing to Postgres
// changes directly as anon. The tickets table has no anonymous SELECT grant (see migration
// 004_close_public_data_leaks.sql) — direct anon reads of `tickets` exposed every customer's
// name and phone number platform-wide, with no scoping to "just this ticket." The server
// action already computes exactly what this hook needs (the caller's own ticket, its queue,
// and its live position) via the service-role client, without ever returning other customers'
// rows to the browser.
export function useQueueRealtime({
  ticketId,
  initialTicket,
  initialQueue,
  initialPosition,
  initialPendingAhead,
}: {
  ticketId: string
  queueId: string
  initialTicket: Ticket | null
  initialQueue: Queue | null
  initialPosition: number
  initialPendingAhead: number
}): QueueRealtimeState {
  const [ticket, setTicket] = useState<Ticket | null>(initialTicket)
  const [queue, setQueue] = useState<Queue | null>(initialQueue)
  const [livePosition, setLivePosition] = useState(initialPosition)
  const [pendingAhead, setPendingAhead] = useState(initialPendingAhead)
  const [isConnected, setIsConnected] = useState(false)
  const inFlight = useRef(false)

  const poll = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const result = await getTicketWithPosition(ticketId)
      if (result.ticket) setTicket(result.ticket)
      if (result.queue) setQueue(result.queue)
      setLivePosition(result.livePosition)
      setPendingAhead(result.pendingAhead)
      setIsConnected(true)
    } catch {
      setIsConnected(false)
    } finally {
      inFlight.current = false
    }
  }, [ticketId])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [poll])

  return { ticket, queue, livePosition, pendingAhead, isConnected }
}
