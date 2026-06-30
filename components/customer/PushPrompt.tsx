'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { subscribeToPush, unsubscribeFromPush } from '@/app/actions/push'

export function PushPrompt({ ticketId, queueId, alreadySubscribed }: {
  ticketId: string
  queueId: string
  alreadySubscribed: boolean
}) {
  const [subscribed, setSubscribed] = useState(alreadySubscribed)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnable() {
    setLoading(true)
    setError(null)
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('Push notifications are not supported in this browser.')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setError('Permission denied. Please enable notifications in your browser settings.')
        return
      }

      let reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!reg) reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey || vapidKey.startsWith('REPLACE')) {
        setError('Push notifications are not configured yet. Please try again later.')
        return
      }

      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const p256dhKey = sub.getKey('p256dh')!
      const authKey = sub.getKey('auth')!
      await subscribeToPush({
        ticket_id: ticketId,
        queue_id: queueId,
        subscription: {
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...Array.from(new Uint8Array(p256dhKey)))),
            auth: btoa(String.fromCharCode(...Array.from(new Uint8Array(authKey)))),
          },
        },
      })
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleDisable() {
    setLoading(true)
    setError(null)
    try {
      // Unsubscribe the browser push subscription
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }
      await unsubscribeFromPush({ ticket_id: ticketId })
      setSubscribed(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable notifications')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">Notifications enabled</p>
          <p className="text-xs text-text-tertiary mt-1.5">We&apos;ll alert you when it&apos;s your turn, even if this tab is closed.</p>
        </div>
        <button
          onClick={handleDisable}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-danger transition-colors px-2.5 py-1.5 rounded-lg hover:bg-danger/8 disabled:opacity-50"
        >
          {loading ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          )}
          Disable
        </button>
        {error && <p className="text-danger text-xs mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="card p-4">
      <p className="text-sm font-medium text-text-primary mb-1">Get notified when it&apos;s your turn</p>
      <p className="text-xs text-text-tertiary mb-3">Enable push notifications so you don&apos;t miss your turn — even with this tab closed.</p>
      <Button variant="primary" onClick={handleEnable} loading={loading} className="w-full">
        Enable Notifications
      </Button>
      {error && <p className="text-danger text-xs mt-2">{error}</p>}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr.buffer
}
