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
      {/* Ticket number + position */}
      <div className="shrink-0 flex flex-col items-start gap-0.5 w-16">
        {isDone ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={ticket.status === 'completed' ? 'text-success' : 'text-text-tertiary'}>
            {ticket.status === 'completed'
              ? <path d="M13 4L6 11l-3-3" />
              : <path d="M12 4L4 12M4 4l8 8" />}
          </svg>
        ) : (
          <>
            <span className="text-base font-extrabold font-mono text-primary leading-none">
              #{ticket.ticket_number}
            </span>
            <span className="text-[10px] font-mono text-text-tertiary leading-none">pos {position}</span>
          </>
        )}
      </div>

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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.122 1.528 5.855L.057 23.882a.5.5 0 0 0 .617.617l6.086-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.536-5.375-1.469l-.385-.228-3.985.962.979-3.908-.249-.401A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
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
