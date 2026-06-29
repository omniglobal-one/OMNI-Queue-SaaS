'use client'

import { useTransition } from 'react'
import { skipTicket, markComplete } from '@/app/actions/queues'
import { logWhatsAppSend } from '@/app/actions/whatsapp'
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/whatsapp'
import type { Ticket, Queue } from '@/types'

export function CurrentlyServing({ ticket, queue }: { ticket: Ticket | null; queue: Queue }) {
  const [isPending, startTransition] = useTransition()

  function handleSkip() {
    if (!ticket) return
    startTransition(async () => { await skipTicket({ ticket_id: ticket.id }) })
  }

  function handleComplete() {
    if (!ticket) return
    startTransition(async () => { await markComplete({ ticket_id: ticket.id }) })
  }

  async function handleWhatsApp(template: 'ready' | 'no_show') {
    if (!ticket?.customer_phone) return
    const message = generateWhatsAppMessage({
      template,
      customerName: ticket.customer_name ?? '',
      ticketNumber: ticket.ticket_number,
      invoiceNumber: ticket.invoice_number,
      businessName: queue.name,
      waitTime: 0,
    })
    await logWhatsAppSend({ ticket_id: ticket.id, queue_id: queue.id, template, message_body: message })
    window.open(generateWhatsAppLink(ticket.customer_phone, message), '_blank')
  }

  if (!ticket) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[100px]">
        <p className="text-text-tertiary text-sm">No ticket currently being served</p>
      </div>
    )
  }

  const calledTime = ticket.called_at
    ? new Date(ticket.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="card border-primary/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-bg-border">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <p className="text-sm font-semibold text-primary">Now Serving</p>
        {calledTime && (
          <span className="ml-auto text-xs text-text-tertiary">Called at {calledTime}</span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-primary tracking-tight">{ticket.ticket_number}</span>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-semibold text-text-primary text-base leading-snug">
            {ticket.customer_name ?? <span className="text-text-tertiary font-normal italic text-sm">No name provided</span>}
          </p>
          {ticket.customer_phone && (
            <p className="flex items-center gap-1.5 text-sm text-text-secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l1.93-1.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {ticket.customer_phone}
            </p>
          )}
          {ticket.invoice_number && (
            <p className="text-sm text-text-secondary">Invoice #{ticket.invoice_number}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-success text-white hover:bg-success/90 transition-colors disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M13 4L6 11l-3-3" />
          </svg>
          Complete
        </button>

        <button
          onClick={handleSkip}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 4L4 12M4 4l8 8" />
          </svg>
          Skip
        </button>

        {ticket.customer_phone && (
          <>
            <button
              onClick={() => handleWhatsApp('ready')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-success bg-success/10 hover:bg-success/20 transition-colors disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 .74l.7 2.8a1 1 0 0 1-.43 1.07l-.77.46a8.2 8.2 0 0 0 3.93 3.93l.46-.77a1 1 0 0 1 1.07-.43l2.8.7a1 1 0 0 1 .74 1V14a1 1 0 0 1-1 1C6.38 15 1 9.62 1 3a1 1 0 0 1 1-1z" />
              </svg>
              WA Ready
            </button>
            <button
              onClick={() => handleWhatsApp('no_show')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary bg-bg-border hover:bg-bg-border/80 transition-colors disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 .74l.7 2.8a1 1 0 0 1-.43 1.07l-.77.46a8.2 8.2 0 0 0 3.93 3.93l.46-.77a1 1 0 0 1 1.07-.43l2.8.7a1 1 0 0 1 .74 1V14a1 1 0 0 1-1 1C6.38 15 1 9.62 1 3a1 1 0 0 1 1-1z" />
              </svg>
              WA No Show
            </button>
          </>
        )}
      </div>
    </div>
  )
}
