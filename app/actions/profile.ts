'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUSINESS_NAME_MAX = 100

export async function updateBusinessName({
  business_name,
}: {
  business_name: string
}): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const trimmed = business_name.trim()
  if (!trimmed) return { error: 'Business name cannot be empty.' }
  if (trimmed.length > BUSINESS_NAME_MAX) {
    return { error: `Business name must be ${BUSINESS_NAME_MAX} characters or less.` }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ business_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update business name. Please try again.' }
  return {}
}
