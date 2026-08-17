import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsClient } from './SettingsClient'
import type { Profile } from '@/types'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile) redirect('/login')

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  return (
    <SettingsClient
      profile={profile}
      userEmail={user.email ?? ''}
      userId={user.id}
      memberSince={memberSince}
    />
  )
}
