import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Profile, Role } from '@/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={profile.role as Role}
        userEmail={user.email ?? ''}
        userName={profile.business_name}
      />
    }>
      {children}
    </DashboardShell>
  )
}
