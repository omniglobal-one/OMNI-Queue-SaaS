import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { CookieConsent } from '@/components/CookieConsent'
import { SuppressRealtimeErrors } from '@/components/SuppressRealtimeErrors'
import { RegisterSW } from '@/components/RegisterSW'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'OMNI Queue',
  description: 'Digital queue management — real-time tickets, live positions, and instant notifications.',
  icons: { icon: '/icon.png', apple: '/icons/icon-192.png' },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'OMNI Queue' },
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body>{children}<CookieConsent /><SuppressRealtimeErrors /><RegisterSW /></body>
    </html>
  )
}
