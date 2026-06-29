'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Ticket, Queue } from '@/types'

export interface QueueRealtimeState {
  ticket: Ticket | null
  queue: Queue | null
  livePosition: number
  pendingAhead: number
  isConnected: boolean
}

export function useQueueRealtime({
  ticketId,
  queueId,
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
  const supabase = useRef(createClient())

  useEffect(() => {
    const client = supabase.current

    const channel = client
      .channel(`queue-${queueId}-ticket-${ticketId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `queue_id=eq.${queueId}`,
      }, async () => {
        // Refetch the full pending list to recalculate position
        const { data: ticketData } = await client
          .from('tickets').select('*').eq('id', ticketId).single()
        if (ticketData) setTicket(ticketData as Ticket)

        const { data: pendingData } = await client
          .from('tickets')
          .select('id')
          .eq('queue_id', queueId)
          .eq('status', 'pending')
          .order('created_at', { ascending: true })

        const pending = (pendingData ?? []) as { id: string }[]
        const idx = pending.findIndex(t => t.id === ticketId)
        if (idx >= 0) {
          setLivePosition(idx + 1)
          setPendingAhead(idx)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'queues',
        filter: `id=eq.${queueId}`,
      }, async () => {
        const { data: queueData } = await client
          .from('queues').select('*').eq('id', queueId).single()
        if (queueData) setQueue(queueData as Queue)
      })
      .subscribe(status => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { void client.removeChannel(channel) }
  }, [ticketId, queueId])

  return { ticket, queue, livePosition, pendingAhead, isConnected }
}
