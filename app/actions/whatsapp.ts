'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { WhatsAppTemplate } from '@/types'

const MESSAGE_BODY_MAX = 2000

export async function logWhatsAppSend({
  ticket_id,
  queue_id,
  template,
  message_body,
}: {
  ticket_id: string
  queue_id: string
  template: WhatsAppTemplate
  message_body: string
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const VALID_TEMPLATES = ['next_up', 'ready', 'no_show', 'custom'] as const
  if (!VALID_TEMPLATES.includes(template as typeof VALID_TEMPLATES[number])) {
    return { error: 'Invalid template' }
  }
  if (message_body.length > MESSAGE_BODY_MAX) return { error: 'Message too long' }

  const admin = createAdminClient()

  // Verify the calling user owns this queue (or is admin)
  const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = (profileRaw as { role: string } | null)?.role === 'admin'

  if (!isAdmin) {
    const { data: queueRaw } = await admin.from('queues').select('merchant_id').eq('id', queue_id).single()
    const queue = queueRaw as { merchant_id: string } | null
    if (!queue || queue.merchant_id !== user.id) return { error: 'Forbidden' }
  }

  // Verify the ticket actually belongs to this queue
  const { data: ticketRaw } = await admin.from('tickets').select('queue_id').eq('id', ticket_id).single()
  const ticket = ticketRaw as { queue_id: string } | null
  if (!ticket || ticket.queue_id !== queue_id) return { error: 'Ticket does not belong to this queue' }

  const { error } = await admin.from('whatsapp_log').insert({
    ticket_id,
    queue_id,
    message_template: template,
    message_body,
    sent_by: user.id,
  })

  if (error) return { error: 'Failed to log message. Please try again.' }
  return {}
}
