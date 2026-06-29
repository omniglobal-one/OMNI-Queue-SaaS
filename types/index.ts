export type Role = 'merchant' | 'admin'

export type QueueStatus = 'open' | 'paused' | 'closed'
export type QueueMode = 'auto' | 'invoice'
export type TicketStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type EventType =
  | 'ticket_issued'
  | 'called_next'
  | 'skipped'
  | 'completed'
  | 'delay_set'
  | 'queue_paused'
  | 'queue_resumed'
  | 'queue_closed'
export type WhatsAppTemplate = 'next_up' | 'ready' | 'no_show' | 'custom'

export interface Profile {
  id: string
  role: Role
  business_name: string | null
  business_slug: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Queue {
  id: string
  merchant_id: string
  name: string
  slug: string
  description: string | null
  mode: QueueMode
  status: QueueStatus
  avg_service_minutes: number
  manual_delay_minutes: number
  current_ticket_id: string | null
  next_counter: number
  is_accepting: boolean
  max_tickets: number | null
  passcode: string | null
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  queue_id: string
  ticket_number: string
  invoice_number: string | null
  customer_name: string | null
  customer_phone: string | null
  push_subscription: PushSubscriptionData | null
  position: number
  status: TicketStatus
  called_at: string | null
  completed_at: string | null
  skipped_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface QueueEvent {
  id: string
  queue_id: string
  ticket_id: string | null
  event_type: EventType
  actor_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

export interface WhatsAppLog {
  id: string
  ticket_id: string
  queue_id: string
  message_template: WhatsAppTemplate
  message_body: string
  sent_by: string
  sent_at: string
}

export interface TicketWithPosition extends Ticket {
  live_position: number
  pending_ahead: number
}
