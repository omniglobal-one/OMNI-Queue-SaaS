'use client'

import { useEffect } from 'react'

export function SuppressRealtimeErrors() {
  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      if (event.reason instanceof Event) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])
  return null
}
