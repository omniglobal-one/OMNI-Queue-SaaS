'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-bg-border px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-lg">
      <p className="text-xs text-text-secondary flex-1">
        We use browser-based storage to manage your queue session and remember your preferences.
        By using OMNI Queue you agree to our{' '}
        <Link href="/privacy" className="underline hover:text-text-primary transition-colors">
          Privacy Policy &amp; Terms of Use
        </Link>.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={acknowledge}
          className="text-xs font-medium bg-primary text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
