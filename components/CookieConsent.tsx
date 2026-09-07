'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'omni_queue_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function acknowledge() {
    localStorage.setItem(STORAGE_KEY, 'acknowledged')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-start gap-3 border-t border-border bg-card px-4 py-3 shadow-lg sm:flex-row sm:items-center">
      <p className="flex-1 text-xs text-muted-foreground">
        We use browser-based storage to manage your queue session and remember your preferences.
        By using OMNI Queue you agree to our{' '}
        <Link href="/privacy" className="underline hover:text-foreground transition-colors">
          Privacy Policy &amp; Terms of Use
        </Link>
        .
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={acknowledge}>
          Got it
        </Button>
      </div>
    </div>
  )
}
