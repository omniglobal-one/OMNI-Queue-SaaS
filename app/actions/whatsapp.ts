'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { WhatsAppTemplate } from '@/types'

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

  const admin = createAdminClient()
  const { error } = await admin.from('whatsapp_log').insert({
    ticket_id,
    queue_id,
    message_template: template,
    message_body,
    sent_by: user.id,
  })

  if (error) return { error: error.message }
  return {}
}
