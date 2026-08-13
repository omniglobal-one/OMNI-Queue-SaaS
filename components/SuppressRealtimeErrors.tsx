'use client'

import { useEffect } from 'react'

// Supabase Realtime's WebSocket client rejects promises with a DOM Event (not an Error)
// whenever a socket closes/errors — harmless, since Realtime has its own reconnect logic,
// but Next.js's dev overlay stringifies these as unhelpful "[object Event]" errors. Only
// suppress rejections that are actually WebSocket-shaped events; anything else Event-shaped
// gets logged instead of silently eaten, so a real future bug with the same shape is still
// visible somewhere.
export function SuppressRealtimeErrors() {
  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      const reason: unknown = event.reason
      const isRealtimeSocketEvent =
        reason instanceof CloseEvent ||
        (reason instanceof Event &&
          (reason.type === 'error' || reason.type === 'close') &&
          reason.target instanceof WebSocket)

      if (isRealtimeSocketEvent) {
        event.preventDefault()
        return
      }
      if (reason instanceof Event) {
        // eslint-disable-next-line no-console
        console.error('Unhandled Event-shaped promise rejection:', reason)
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])
  return null
}
