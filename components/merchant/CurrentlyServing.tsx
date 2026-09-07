'use client'

import { useTransition } from 'react'
import { Check, X, Phone } from 'lucide-react'
import { skipTicket, markComplete } from '@/app/actions/queues'
import { logWhatsAppSend } from '@/app/actions/whatsapp'
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { Card, CardContent } from '@/components/ui/card'
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
      <Card>
        <CardContent className="flex min-h-[100px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">No ticket currently being served</p>
        </CardContent>
      </Card>
    )
  }

  const calledTime = ticket.called_at
    ? new Date(ticket.called_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <Card className="overflow-hidden border-primary/30">
      <div className="flex items-center gap-2 border-b border-border px-5 pb-3 pt-4">
        <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" />
        <p className="text-sm font-semibold text-primary">Now Serving</p>
        {calledTime && <span className="ml-auto text-xs text-muted-foreground">Called at {calledTime}</span>}
      </div>

      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <span className="text-xl font-bold tracking-tight text-primary">{ticket.ticket_number}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-semibold leading-snug">
            {ticket.customer_name ?? <span className="text-sm font-normal italic text-muted-foreground">No name provided</span>}
          </p>
          {ticket.customer_phone && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {ticket.customer_phone}
            </p>
          )}
          {ticket.invoice_number && (
            <p className="text-sm text-muted-foreground">Invoice #{ticket.invoice_number}</p>
          )}
          <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-50"
        >
          <Check className="size-3.5" strokeWidth={2.5} /> Complete
        </button>

        <button
          onClick={handleSkip}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
        >
          <X className="size-3.5" strokeWidth={2.5} /> Skip
        </button>

        {ticket.customer_phone && (
          <>
            <button
              onClick={() => handleWhatsApp('ready')}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
            >
              <WhatsAppIcon /> WA Ready
            </button>
            <button
              onClick={() => handleWhatsApp('no_show')}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
            >
              <WhatsAppIcon /> WA No Show
            </button>
          </>
        )}
      </div>
    </Card>
  )
}
