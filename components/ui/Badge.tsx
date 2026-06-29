import type { ReactNode } from 'react'

type Variant = 'success' | 'danger' | 'secondary' | 'neutral' | 'primary' | 'warning' | 'live'

const variantClass: Record<Variant, string> = {
  success: 'badge-success',
  danger: 'badge-danger',
  secondary: 'badge-secondary',
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  warning: 'badge-warning',
  live: 'badge-live',
}

export function Badge({ variant, children, pill }: { variant: Variant; children: ReactNode; pill?: boolean }) {
  return (
    <span className={`${pill ? 'badge-pill' : 'badge'} ${variantClass[variant]}`}>
      {children}
    </span>
  )
}

export function QueueStatusBadge({ status }: { status: string }) {
  if (status === 'open') return <Badge variant="success">Open</Badge>
  if (status === 'paused') return <Badge variant="warning">Paused</Badge>
  return <Badge variant="neutral">Closed</Badge>
}

export function TicketStatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <Badge variant="neutral">Waiting</Badge>
  if (status === 'in_progress') return <Badge variant="live">Being Served</Badge>
  if (status === 'completed') return <Badge variant="success">Completed</Badge>
  return <Badge variant="danger">Skipped</Badge>
}
