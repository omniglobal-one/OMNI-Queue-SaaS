'use client'

import { useState } from 'react'
import { Bell, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
      setError('Failed to enable notifications. Please check your browser permissions and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDisable() {
    setLoading(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }
      await unsubscribeFromPush({ ticket_id: ticketId })
      setSubscribed(false)
    } catch (e) {
      setError('Failed to disable notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15">
            <Bell className="size-4 text-success" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Notifications enabled</p>
            <p className="mt-1.5 text-xs text-muted-foreground">We&apos;ll alert you when it&apos;s your turn, even if this tab is closed.</p>
          </div>
          <button
            onClick={handleDisable}
            disabled={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
            Disable
          </button>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-1 text-sm font-medium">Get notified when it&apos;s your turn</p>
        <p className="mb-3 text-xs text-muted-foreground">Enable push notifications so you don&apos;t miss your turn — even with this tab closed.</p>
        <Button onClick={handleEnable} disabled={loading} className="w-full">
          {loading && <Loader2 className="size-4 animate-spin" />} Enable Notifications
        </Button>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
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
