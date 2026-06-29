import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import type { Profile } from '@/types'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile) redirect('/login')

  return (
    <>
      <Topbar title="Account Settings" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg">
          <div className="card p-6 flex flex-col gap-4">
            <div>
              <label className="label">Email</label>
              <div className="input bg-bg-base text-text-tertiary cursor-not-allowed">{user.email}</div>
            </div>
            <div>
              <label className="label">Business Name</label>
              <div className="input bg-bg-base text-text-secondary">{profile.business_name ?? '—'}</div>
            </div>
            <div>
              <label className="label">Role</label>
              <div className="input bg-bg-base text-text-secondary capitalize">{profile.role}</div>
            </div>
            <p className="text-xs text-text-tertiary">To update your details, contact your administrator.</p>
          </div>
        </div>
      </div>
    </>
  )
}
