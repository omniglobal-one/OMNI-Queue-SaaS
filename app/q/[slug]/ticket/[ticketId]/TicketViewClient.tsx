'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQueueRealtime } from '@/hooks/useQueueRealtime'
import { StatusCard } from '@/components/customer/StatusCard'
import { PushPrompt } from '@/components/customer/PushPrompt'
import { PhoneAddForm } from '@/components/customer/PhoneAddForm'
import { ReconnectBanner } from '@/components/customer/ReconnectBanner'
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
    <div className="min-h-screen bg-bg-base">
      <header className="h-14 bg-bg-card border-b border-bg-border flex items-center justify-between px-4">
        <Link href={`/q/${queue.slug}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-text-primary text-sm">{PLATFORM.name}</span>
        </Link>
        {isActive && (
          <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-success' : 'text-text-tertiary'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-text-tertiary'}`} />
            {isConnected ? 'Live' : 'Connecting…'}
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <ReconnectBanner isConnected={isConnected} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left — ticket status */}
          <StatusCard
            ticket={ticket}
            queue={queue}
            livePosition={livePosition}
            pendingAhead={pendingAhead}
          />

          {/* Right — actions */}
          <div className="flex flex-col gap-4">
            {isActive && (
              <>
                <PushPrompt
                  ticketId={ticket.id}
                  queueId={queue.id}
                  alreadySubscribed={!!ticket.push_subscription}
                />
                <PhoneAddForm ticketId={ticket.id} currentPhone={ticket.customer_phone} />
              </>
            )}

            <div className="card p-4 space-y-2 text-center ring-1 ring-primary/40 shadow-lg shadow-primary/20">
              <p className="text-sm font-medium text-text-primary">Save your place in the queue</p>
              <p className="text-xs text-text-tertiary">Copy this link to come back to your ticket from any device or browser.</p>
              <button
                onClick={handleCopyLink}
                className={`btn-ghost w-full flex items-center justify-center gap-2 transition-colors ${copied ? 'text-success' : ''}`}
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M13 4L6 11l-3-3" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy link to my ticket
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-text-tertiary">Keep this page open to track your position in real time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
