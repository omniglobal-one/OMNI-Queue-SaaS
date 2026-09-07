'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useQueueRealtime } from '@/hooks/useQueueRealtime'
import { StatusCard } from '@/components/customer/StatusCard'
import { PushPrompt } from '@/components/customer/PushPrompt'
import { PhoneAddForm } from '@/components/customer/PhoneAddForm'
import { ReconnectBanner } from '@/components/customer/ReconnectBanner'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PLATFORM } from '@/lib/platform-info'
import type { Ticket, Queue } from '@/types'

export function TicketViewClient({
  initialTicket,
  initialQueue,
  initialPosition,
  initialPendingAhead,
}: {
  initialTicket: Ticket
  initialQueue: Queue
  initialPosition: number
  initialPendingAhead: number
}) {
  const { ticket, queue, livePosition, pendingAhead, isConnected } = useQueueRealtime({
    ticketId: initialTicket.id,
    queueId: initialQueue.id,
    initialTicket,
    initialQueue,
    initialPosition,
    initialPendingAhead,
  })

  const [copied, setCopied] = useState(false)

  if (!ticket || !queue) return null

  const isActive = ticket.status === 'pending' || ticket.status === 'in_progress'

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for browsers that block clipboard without user gesture
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <Link href={`/q/${queue.slug}`} className="flex items-center gap-2">
          <Image src="/icon.png" alt="" width={24} height={24} className="rounded-lg" />
          <span className="text-sm font-semibold">{PLATFORM.name}</span>
        </Link>
        {isActive && (
          <div className={cn('flex items-center gap-1.5 text-xs', isConnected ? 'text-success' : 'text-muted-foreground')}>
            <span className={cn('size-1.5 rounded-full', isConnected ? 'animate-pulse bg-success' : 'bg-muted-foreground')} />
            {isConnected ? 'Live' : 'Connecting…'}
          </div>
        )}
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <ReconnectBanner isConnected={isConnected} />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <StatusCard ticket={ticket} queue={queue} livePosition={livePosition} pendingAhead={pendingAhead} />

          <div className="flex flex-col gap-4">
            {isActive && (
              <>
                <PushPrompt ticketId={ticket.id} queueId={queue.id} alreadySubscribed={!!ticket.push_subscription} />
                <PhoneAddForm ticketId={ticket.id} currentPhone={ticket.customer_phone} />
              </>
            )}

            <Card className="text-center shadow-lg shadow-primary/20 ring-1 ring-primary/40">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium">Save your place in the queue</p>
                <p className="text-xs text-muted-foreground">Copy this link to come back to your ticket from any device or browser.</p>
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent',
                    copied && 'text-success'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="size-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Copy link to my ticket
                    </>
                  )}
                </button>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">Keep this page open to track your position in real time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
