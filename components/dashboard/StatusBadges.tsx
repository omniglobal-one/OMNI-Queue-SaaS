import { Badge } from '@/components/ui/badge'
import type { Queue, Ticket } from '@/types'

export function QueueStatusBadge({ status }: { status: Queue['status'] }) {
  if (status === 'open') return <Badge variant="success">Open</Badge>
  if (status === 'paused') return <Badge variant="warning">Paused</Badge>
  return <Badge variant="secondary">Closed</Badge>
}

export function TicketStatusBadge({ status }: { status: Ticket['status'] }) {
  if (status === 'pending') return <Badge variant="secondary">Waiting</Badge>
  if (status === 'in_progress') return <Badge className="animate-pulse">Being served</Badge>
  if (status === 'completed') return <Badge variant="success">Completed</Badge>
  return <Badge variant="destructive">Skipped</Badge>
}
