import type { Ticket } from '@/types'

export function CurrentlyServing({ ticket }: { ticket: Ticket | null }) {
  if (!ticket) {
    return (
      <div className="card p-6 text-center">
        <p className="text-text-tertiary text-sm">No ticket currently being served</p>
      </div>
    )
  }

  return (
    <div className="card p-6 border-primary/30 shadow-glow">
      <p className="section-title text-primary mb-4">Now Serving</p>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{ticket.ticket_number}</span>
        </div>
        <div>
          {ticket.customer_name && (
            <p className="font-semibold text-text-primary">{ticket.customer_name}</p>
          )}
          {ticket.invoice_number && (
            <p className="text-sm text-text-secondary">Invoice #{ticket.invoice_number}</p>
          )}
          {ticket.customer_phone && (
            <p className="text-sm text-text-tertiary">{ticket.customer_phone}</p>
          )}
          {ticket.called_at && (
            <p className="text-xs text-text-tertiary mt-1">
              Called {new Date(ticket.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
