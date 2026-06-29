import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/Badge'
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
      <Topbar title="Account Settings" subtitle="Your profile and account details" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="card p-6">
            <h2 className="section-header">Profile</h2>
            <div className="space-y-3 divide-y divide-bg-border">
              <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <span className="text-text-secondary text-sm">Business Name</span>
                <span className="text-text-primary text-sm font-medium">{profile.business_name ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Role</span>
                <Badge variant="neutral">{profile.role === 'admin' ? 'Admin' : 'Merchant'}</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Status</span>
                <Badge variant={profile.is_active ? 'success' : 'danger'}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="section-header">Account</h2>
            <div className="space-y-3 divide-y divide-bg-border">
              <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <span className="text-text-secondary text-sm">Email</span>
                <span className="text-text-tertiary text-sm font-mono">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">User ID</span>
                <span className="text-text-tertiary text-xs font-mono">{user.id.slice(0, 8)}…</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Member since</span>
                <span className="text-text-tertiary text-sm">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-tertiary px-1">
            To update your details, contact your administrator.
          </p>
        </div>
      </div>
    </>
  )
}
