'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateBusinessName } from '@/app/actions/profile'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [memberSince, setMemberSince] = useState<string>('')

  const [businessName, setBusinessName] = useState('')
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserEmail(user.email ?? '')
      setUserId(user.id)
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          const p = data as Profile
          setProfile(p)
          setBusinessName(p.business_name ?? '')
          setMemberSince(new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }))
        }
      })
    })
  }, [])

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateBusinessName({ business_name: businessName })
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  function handleCancel() {
    setBusinessName(profile?.business_name ?? '')
    setEditing(false)
    setError(null)
  }

  if (!profile) {
    return (
      <>
        <Topbar title="Account Settings" subtitle="Your profile and account details" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="skeleton h-48 rounded-lg" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar
        title="Account Settings"
        subtitle="Your profile and account details"
        actions={
          saved ? <Badge variant="success">Saved</Badge> : undefined
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="card p-6">
            <h2 className="section-header">Profile</h2>
            <div className="space-y-3 divide-y divide-bg-border">
              <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0 gap-4">
                <span className="text-text-secondary text-sm shrink-0">Business Name</span>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="input text-sm"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Your business name"
                      autoFocus
                    />
                    <Button onClick={handleSave} loading={isPending} className="h-8 text-xs px-3">Save</Button>
                    <button onClick={handleCancel} className="text-xs text-text-tertiary hover:text-text-primary transition-colors">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary text-sm font-medium">{profile.business_name ?? '—'}</span>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-primary hover:text-primary-hover transition-colors"
                      title="Edit business name"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {error && (
                <div className="py-2 text-danger text-sm">{error}</div>
              )}
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
                <span className="text-text-tertiary text-sm font-mono">{userEmail}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">User ID</span>
                <span className="text-text-tertiary text-xs font-mono">{userId.slice(0, 8)}…</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Member since</span>
                <span className="text-text-tertiary text-sm">{memberSince}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
