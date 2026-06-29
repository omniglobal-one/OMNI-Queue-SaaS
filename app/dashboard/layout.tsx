import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Profile, Role } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <Topbar businessName={profile.business_name} />
      <div className="flex flex-1 min-h-0">
        <Sidebar role={profile.role as Role} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
