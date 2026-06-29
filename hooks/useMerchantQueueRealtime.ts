'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Queue, Ticket } from '@/types'

export interface MerchantQueueRealtimeState {
  queue: Queue
  tickets: Ticket[]
  isConnected: boolean
}

export function useMerchantQueueRealtime({
  initialQueue,
  initialTickets,
}: {
  initialQueue: Queue
  initialTickets: Ticket[]
}): MerchantQueueRealtimeState {
  const [queue, setQueue] = useState<Queue>(initialQueue)
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = useRef(createClient())

  useEffect(() => {
    const client = supabase.current
    const queueId = initialQueue.id

    const refetchTickets = async () => {
      const { data } = await client
        .from('tickets')
        .select('*')
        .eq('queue_id', queueId)
        .order('created_at', { ascending: true })
      if (data) setTickets(data as Ticket[])
    }

    const channel = client
      .channel(`merchant-queue-${queueId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `queue_id=eq.${queueId}`,
      }, () => { void refetchTickets() })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'queues',
        filter: `id=eq.${queueId}`,
      }, async () => {
        const { data } = await client.from('queues').select('*').eq('id', queueId).single()
        if (data) setQueue(data as Queue)
      })
      .subscribe(status => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { void client.removeChannel(channel) }
  }, [initialQueue.id])

  return { queue, tickets, isConnected }
}
