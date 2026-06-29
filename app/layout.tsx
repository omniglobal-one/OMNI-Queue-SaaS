import type { Metadata } from 'next'
import './globals.css'
import { CookieConsent } from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'OMNI Queue',
  description: 'Digital queue management — real-time tickets, live positions, and instant notifications.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}<CookieConsent /></body>
    </html>
  )
}
