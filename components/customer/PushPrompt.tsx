'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { subscribeToPush } from '@/app/actions/push'

export function PushPrompt({ ticketId, queueId, alreadySubscribed }: {
  ticketId: string
  queueId: string
  alreadySubscribed: boolean
}) {
  const [subscribed, setSubscribed] = useState(alreadySubscribed)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (subscribed) {
    return (
      <div className="card p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Notifications enabled</p>
          <p className="text-xs text-text-tertiary mt-0.5">We&apos;ll alert you when it&apos;s your turn, even if this tab is closed.</p>
        </div>
      </div>
    )
  }

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

      // Register the push service worker if not already registered
      let reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      }

      // Wait for the SW to become active
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
      const payload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...Array.from(new Uint8Array(p256dhKey)))),
          auth: btoa(String.fromCharCode(...Array.from(new Uint8Array(authKey)))),
        },
      }

      await subscribeToPush({ ticket_id: ticketId, queue_id: queueId, subscription: payload })
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable notifications')
    } finally {
      setLoading(false)
    }
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
