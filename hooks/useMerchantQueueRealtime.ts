'use client'

import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeAccessToken } from '@/app/actions/auth'
import type { Queue, Ticket } from '@/types'

export interface MerchantQueueRealtimeState {
  queue: Queue
  tickets: Ticket[]
  isConnected: boolean
}

// How often to re-fetch a fresh access token, rebuild the client, and resubscribe. Access
// tokens are short-lived (~1hr); this client bakes the token into its REST Authorization header
// at construction time (rather than a session it can silently refresh itself), so it has to be
// rebuilt to pick up a new one. A brief reconnect is an acceptable trade for never handing the
// browser a long-lived credential.
const TOKEN_REFRESH_MS = 45 * 60 * 1000

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

  useEffect(() => {
    let cancelled = false
    let client: ReturnType<typeof createClient> | null = null
    let channel: RealtimeChannel | null = null
    const queueId = initialQueue.id

    async function connect() {
      const token = await getRealtimeAccessToken()
      if (cancelled || !token) return

      client = createClient(token)
      client.realtime.setAuth(token)
      const activeClient = client

      const refetchTickets = async () => {
        const { data } = await activeClient
          .from('tickets')
          .select('*')
          .eq('queue_id', queueId)
          .order('created_at', { ascending: true })
        if (data) setTickets(data as Ticket[])
      }

      channel = activeClient
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
          const { data } = await activeClient.from('queues').select('*').eq('id', queueId).single()
          if (data) setQueue(data as Queue)
        })
        .subscribe(status => {
          if (!cancelled) setIsConnected(status === 'SUBSCRIBED')
        })
    }

    function teardown() {
      if (client && channel) void client.removeChannel(channel)
      client = null
      channel = null
    }

    connect()
    const refreshInterval = setInterval(() => { teardown(); connect() }, TOKEN_REFRESH_MS)

    return () => {
      cancelled = true
      clearInterval(refreshInterval)
      teardown()
    }
  }, [initialQueue.id])

  return { queue, tickets, isConnected }
}
