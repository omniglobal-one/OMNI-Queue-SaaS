'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const NAME_MAX = 100
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, error: 'Unauthorized' as const }
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if ((data as { role: string } | null)?.role !== 'admin') return { user: null, error: 'Forbidden' as const }
  return { user, error: null }
}

export async function toggleMerchantActive({
  merchant_id,
  is_active,
}: {
  merchant_id: string
  is_active: boolean
}): Promise<{ error?: string }> {
  const { error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  if (typeof is_active !== 'boolean') return { error: 'Invalid value' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', merchant_id)

  if (error) return { error: 'Failed to update merchant status. Please try again.' }
  return {}
}

export async function deleteMerchant({
  merchant_id,
}: {
  merchant_id: string
}): Promise<{ error?: string }> {
  const { error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const { error: profileError } = await admin.from('profiles').delete().eq('id', merchant_id)
  if (profileError) return { error: 'Failed to remove merchant. Please try again.' }

  const { error: authUserError } = await admin.auth.admin.deleteUser(merchant_id)
  if (authUserError) return { error: 'Merchant profile removed but auth account deletion failed. Please contact support.' }

  return {}
}

export async function adminDeleteQueue({
  queue_id,
}: {
  queue_id: string
}): Promise<{ error?: string }> {
  const { error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const { error } = await admin.from('queues').delete().eq('id', queue_id)
  if (error) return { error: 'Failed to delete queue. Please try again.' }
  return {}
}

export async function adminCreateQueue({
  merchant_id,
  name,
  mode,
  slug,
  avg_service_minutes,
}: {
  merchant_id: string
  name: string
  mode: 'auto' | 'invoice'
  slug: string
  avg_service_minutes: number
}): Promise<{ id: string } | { error: string }> {
  const { error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  // Server-side validation
  if (!name.trim()) return { error: 'Queue name is required' }
  if (name.trim().length > NAME_MAX) return { error: `Queue name must be ${NAME_MAX} characters or less` }
  if (!SLUG_RE.test(slug)) return { error: 'Slug must be lowercase letters, numbers and hyphens only' }
  if (!['auto', 'invoice'].includes(mode)) return { error: 'Invalid mode' }
  if (!Number.isInteger(avg_service_minutes) || avg_service_minutes < 1 || avg_service_minutes > 480) {
    return { error: 'Average service time must be between 1 and 480 minutes' }
  }

  const admin = createAdminClient()
  const existing = await admin.from('queues').select('id').eq('slug', slug).maybeSingle()
  if (existing.data) return { error: 'A queue with this URL slug already exists.' }

  const { data, error } = await admin
    .from('queues')
    .insert({ merchant_id, name: name.trim(), mode, slug: slug.trim(), avg_service_minutes })
    .select('id')
    .single()

  if (error) return { error: 'Failed to create queue. Please try again.' }
  return { id: (data as { id: string }).id }
}
