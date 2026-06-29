'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { TicketStatusBadge } from '@/components/ui/Badge'
import { skipTicket, markComplete } from '@/app/actions/queues'
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
  const [expanded, setExpanded] = useState(false)

  function handleSkip() {
    startTransition(async () => { await skipTicket({ ticket_id: ticket.id }) })
  }

  function handleComplete() {
    startTransition(async () => { await markComplete({ ticket_id: ticket.id }) })
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

  const isPending_ = ticket.status === 'pending'
  const isActive = ticket.status === 'in_progress'

  return (
    <div className={`border-b border-bg-border/50 last:border-b-0 ${isActive ? 'bg-primary/5' : ''}`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg-border/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-8 text-center text-sm font-mono text-text-tertiary">{position}</span>
        <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-text-primary'}`}>
          #{ticket.ticket_number}
        </span>
        <div className="flex-1 min-w-0">
          {ticket.customer_name && (
            <p className="text-sm text-text-primary truncate">{ticket.customer_name}</p>
          )}
          {ticket.invoice_number && (
            <p className="text-xs text-text-tertiary">Inv #{ticket.invoice_number}</p>
          )}
        </div>
        <TicketStatusBadge status={ticket.status} />
        {ticket.customer_phone && (
          <span className="w-4 h-4 text-success flex-shrink-0">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 .74l.7 2.8a1 1 0 0 1-.43 1.07l-.77.46a8.2 8.2 0 0 0 3.93 3.93l.46-.77a1 1 0 0 1 1.07-.43l2.8.7a1 1 0 0 1 .74 1V14a1 1 0 0 1-1 1C6.38 15 1 9.62 1 3a1 1 0 0 1 1-1z" />
            </svg>
          </span>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 bg-bg-border/20">
          {(isPending_ || isActive) && (
            <Button variant="danger" onClick={handleSkip} loading={isPending} className="h-8 text-xs">
              Skip
            </Button>
          )}
          {isActive && (
            <Button variant="success" onClick={handleComplete} loading={isPending} className="h-8 text-xs">
              Complete
            </Button>
          )}
          {ticket.customer_phone && isPending_ && (
            <Button variant="ghost" onClick={() => handleWhatsApp('next_up')} className="h-8 text-xs">
              WA: You&apos;re Next
            </Button>
          )}
          {ticket.customer_phone && isActive && (
            <>
              <Button variant="ghost" onClick={() => handleWhatsApp('ready')} className="h-8 text-xs">
                WA: Ready
              </Button>
              <Button variant="ghost" onClick={() => handleWhatsApp('no_show')} className="h-8 text-xs">
                WA: No Show
              </Button>
            </>
          )}
          {ticket.notes && (
            <p className="w-full text-xs text-text-secondary italic mt-1">{ticket.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}
