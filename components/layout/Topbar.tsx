'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM } from '@/lib/platform-info'
import { Button } from '@/components/ui/Button'

export function Topbar({ businessName }: { businessName?: string | null }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-bg-card border-b border-bg-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
          </svg>
        </div>
        <span className="font-semibold text-text-primary text-sm">{PLATFORM.name}</span>
        {businessName && (
          <>
            <span className="text-bg-border">/</span>
            <span className="text-text-secondary text-sm">{businessName}</span>
          </>
        )}
      </Link>
      <Button variant="ghost" onClick={signOut} className="text-xs h-8 px-3">
        Sign out
      </Button>
    </header>
  )
}
