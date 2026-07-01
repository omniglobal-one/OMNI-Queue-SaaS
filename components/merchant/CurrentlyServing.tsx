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
    ? new Date(ticket.called_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
          <p className="text-xs text-text-tertiary mono">{ticket.id}</p>
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.122 1.528 5.855L.057 23.882a.5.5 0 0 0 .617.617l6.086-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.536-5.375-1.469l-.385-.228-3.985.962.979-3.908-.249-.401A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WA Ready
            </button>
            <button
              onClick={() => handleWhatsApp('no_show')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary bg-bg-border hover:bg-bg-border/80 transition-colors disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.122 1.528 5.855L.057 23.882a.5.5 0 0 0 .617.617l6.086-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.536-5.375-1.469l-.385-.228-3.985.962.979-3.908-.249-.401A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WA No Show
            </button>
          </>
        )}
      </div>
    </div>
  )
}
