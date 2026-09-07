'use client'

import { useState, useTransition } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { updateBusinessName } from '@/app/actions/profile'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import type { Profile } from '@/types'

export function SettingsClient({
  profile: initialProfile,
  userEmail,
  userId,
  memberSince,
}: {
  profile: Profile
  userEmail: string
  userId: string
  memberSince: string
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [businessName, setBusinessName] = useState(initialProfile.business_name ?? '')
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateBusinessName({ business_name: businessName })
      if (result.error) {
        setError(result.error)
      } else {
        setProfile(prev => ({ ...prev, business_name: businessName }))
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  function handleCancel() {
    setBusinessName(profile.business_name ?? '')
    setEditing(false)
    setError(null)
  }

  return (
    <>
      <Topbar
        title="Account Settings"
        subtitle="Your profile and account details"
        actions={saved ? <Badge variant="success">Saved</Badge> : undefined}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Profile</h2>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
                  <span className="shrink-0 text-sm text-muted-foreground">Business Name</span>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        className="text-sm"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="Your business name"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="size-3.5 animate-spin" />} Save
                      </Button>
                      <button onClick={handleCancel} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{profile.business_name ?? '—'}</span>
                      <button
                        onClick={() => setEditing(true)}
                        className="text-primary transition-colors hover:text-primary/80"
                        title="Edit business name"
                      >
                        <Pencil className="size-[13px]" />
                      </button>
                    </div>
                  )}
                </div>
                {error && <div className="py-2 text-sm text-destructive">{error}</div>}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge variant="secondary">{profile.role === 'admin' ? 'Admin' : 'Merchant'}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={profile.is_active ? 'success' : 'destructive'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Account</h2>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-mono text-sm text-muted-foreground">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{userId.slice(0, 8)}…</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm text-muted-foreground">{memberSince}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}
