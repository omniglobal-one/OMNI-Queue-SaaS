'use client'

import { useTransition } from 'react'
import { skipTicket } from '@/app/actions/queues'
import { logWhatsAppSend } from '@/app/actions/whatsapp'
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/whatsapp'
import type { Ticket, Queue } from '@/types'

export function TicketRow({
  ticket,
  queue,
  position,
}: {
  ticket: Ticket
  queue: Queue
  position: number
}) {
  const [isPending, startTransition] = useTransition()

  function handleSkip() {
    startTransition(async () => { await skipTicket({ ticket_id: ticket.id }) })
  }

  async function handleWhatsApp(template: 'next_up' | 'ready' | 'no_show') {
    if (!ticket.customer_phone) return
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

  const isWaiting = ticket.status === 'pending'
  const isDone = ticket.status === 'completed' || ticket.status === 'skipped'

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-bg-border/50 last:border-b-0 ${isDone ? 'opacity-60' : ''}`}>
      {/* Position / status indicator */}
      <div className="w-7 shrink-0 flex items-center justify-center">
        {isDone ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={ticket.status === 'completed' ? 'text-success' : 'text-text-tertiary'}>
            {ticket.status === 'completed'
              ? <path d="M13 4L6 11l-3-3" />
              : <path d="M12 4L4 12M4 4l8 8" />}
          </svg>
        ) : (
          <span className="text-xs font-mono text-text-tertiary">{position}</span>
        )}
      </div>

      {/* Ticket number */}
      <span className="text-sm font-bold font-mono text-text-primary shrink-0 w-16">
        #{ticket.ticket_number}
      </span>

      {/* Customer info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate leading-snug">
          {ticket.customer_name ?? <span className="text-text-tertiary italic">No name</span>}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {ticket.invoice_number && (
            <span className="text-xs text-text-tertiary">Inv #{ticket.invoice_number}</span>
          )}
          {ticket.customer_phone && (
            <span className="flex items-center gap-1 text-xs text-text-tertiary">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="text-success shrink-0">
                <path d="M2 2a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 .74l.7 2.8a1 1 0 0 1-.43 1.07l-.77.46a8.2 8.2 0 0 0 3.93 3.93l.46-.77a1 1 0 0 1 1.07-.43l2.8.7a1 1 0 0 1 .74 1V14a1 1 0 0 1-1 1C6.38 15 1 9.62 1 3a1 1 0 0 1 1-1z" />
              </svg>
              {ticket.customer_phone}
            </span>
          )}
          {ticket.notes && (
            <span className="text-xs text-text-tertiary italic truncate">{ticket.notes}</span>
          )}
        </div>
      </div>

      {/* Inline actions — only for waiting tickets */}
      {isWaiting && (
        <div className="flex items-center gap-2 shrink-0">
          {ticket.customer_phone && (
            <button
              onClick={() => handleWhatsApp('next_up')}
              disabled={isPending}
              title="WhatsApp: You're next"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-success bg-success/10 hover:bg-success/20 transition-colors disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 .74l.7 2.8a1 1 0 0 1-.43 1.07l-.77.46a8.2 8.2 0 0 0 3.93 3.93l.46-.77a1 1 0 0 1 1.07-.43l2.8.7a1 1 0 0 1 .74 1V14a1 1 0 0 1-1 1C6.38 15 1 9.62 1 3a1 1 0 0 1 1-1z" />
              </svg>
              Notify
            </button>
          )}
          <button
            onClick={handleSkip}
            disabled={isPending}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors disabled:opacity-50"
          >
            {isPending ? '…' : 'Skip'}
          </button>
        </div>
      )}
    </div>
  )
}
