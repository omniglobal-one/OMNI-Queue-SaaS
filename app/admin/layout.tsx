import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { QueueShell } from '@/components/layout/QueueShell'
import type { Profile, Role } from '@/types'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileRaw } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <QueueShell role={profile.role as Role} userEmail={user.email ?? ''} userName={profile.business_name}>
      {children}
    </QueueShell>
  )
}
