import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { accentTokensToCssVars, PRODUCTS } from '@omni/tokens'
import './globals.css'
import { CookieConsent } from '@/components/CookieConsent'
import { SuppressRealtimeErrors } from '@/components/SuppressRealtimeErrors'
import { RegisterSW } from '@/components/RegisterSW'

export const metadata: Metadata = {
  title: 'OMNI Queue',
  description: 'Digital queue management — real-time tickets, live positions, and instant notifications.',
  icons: { icon: '/icon.png', apple: '/icons/icon-192.png' },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'OMNI Queue' },
}

export const viewport: Viewport = {
  themeColor: PRODUCTS.queue, // was '#2563EB' — a blue, mismatched to Queue's olive accent
  width: 'device-width',
  initialScale: 1,
}

// Required for the nonce-based CSP in middleware.ts to actually work: Next.js only applies a
// per-request nonce to a page's script tags when that page is dynamically rendered — a
// statically-optimized page's HTML (including script tags) is baked at build time, before any
// request-scoped nonce exists, so the two can never match. Most pages here already read
// cookies()/Supabase server sessions and were already dynamic; this closes the gap for the
// handful that weren't (login, register, join, privacy) — and is a deliberately low-cost trade
// for this app, since it's a per-user dashboard SaaS with no meaningful static-caching workload
// to lose (nothing here is public marketing content that benefits from ISR/CDN caching).
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: accentTokensToCssVars(PRODUCTS.queue) }} />
      </head>
      <body>{children}<CookieConsent /><SuppressRealtimeErrors /><RegisterSW /></body>
    </html>
  )
}
