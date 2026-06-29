import type { Ticket } from '@/types'

export function CurrentlyServing({ ticket }: { ticket: Ticket | null }) {
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
    <div className="card p-6 border-primary/30">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <p className="text-sm font-semibold text-primary">Now Serving</p>
      </div>

      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary tracking-tight">{ticket.ticket_number}</span>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 pt-1">
          {ticket.customer_name ? (
            <p className="font-semibold text-text-primary text-base leading-snug">{ticket.customer_name}</p>
          ) : (
            <p className="text-text-tertiary text-sm italic">No name provided</p>
          )}

          {ticket.customer_phone && (
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l1.93-1.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-sm text-text-secondary">{ticket.customer_phone}</span>
            </div>
          )}

          {ticket.invoice_number && (
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary flex-shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-sm text-text-secondary">Invoice #{ticket.invoice_number}</span>
            </div>
          )}

          {calledTime && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs text-text-tertiary">Called at {calledTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
