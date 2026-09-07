'use client'

import { useTransition } from 'react'
import { Check, X, Phone } from 'lucide-react'
import { skipTicket } from '@/app/actions/queues'
import { logWhatsAppSend } from '@/app/actions/whatsapp'
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { cn } from '@/lib/utils'
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
    <div className={cn('flex items-center gap-3 border-b border-border/50 px-4 py-3.5 last:border-b-0', isDone && 'opacity-60')}>
      {/* Ticket number + position */}
      <div className="flex w-16 shrink-0 flex-col items-start gap-1">
        {isDone ? (
          ticket.status === 'completed'
            ? <Check className="size-4 text-success" strokeWidth={2} />
            : <X className="size-4 text-muted-foreground" strokeWidth={2} />
        ) : (
          <>
            <span className="font-mono text-base font-extrabold leading-none text-primary">
              #{ticket.ticket_number}
            </span>
            <span className="font-mono text-[10px] leading-none text-muted-foreground">pos {position}</span>
          </>
        )}
      </div>

      {/* Customer info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-snug">
          {ticket.customer_name ?? <span className="italic text-muted-foreground">No name</span>}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          {ticket.invoice_number && (
            <span className="text-xs text-muted-foreground">Inv #{ticket.invoice_number}</span>
          )}
          {ticket.customer_phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-2.5 shrink-0 text-success" fill="currentColor" />
              {ticket.customer_phone}
            </span>
          )}
          {ticket.notes && (
            <span className="truncate text-xs italic text-muted-foreground">{ticket.notes}</span>
          )}
        </div>
        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{ticket.id}</p>
      </div>

      {/* Inline actions — only for waiting tickets */}
      {isWaiting && (
        <div className="flex shrink-0 items-center gap-2">
          {ticket.customer_phone && (
            <button
              onClick={() => handleWhatsApp('next_up')}
              disabled={isPending}
              title="WhatsApp: You're next"
              className="flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
            >
              <WhatsAppIcon />
              Notify
            </button>
          )}
          <button
            onClick={handleSkip}
            disabled={isPending}
            className="rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
          >
            {isPending ? '…' : 'Skip'}
          </button>
        </div>
      )}
    </div>
  )
}
