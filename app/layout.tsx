import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { CookieConsent } from '@/components/CookieConsent'
import { SuppressRealtimeErrors } from '@/components/SuppressRealtimeErrors'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'OMNI Queue',
  description: 'Digital queue management — real-time tickets, live positions, and instant notifications.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body>{children}<CookieConsent /><SuppressRealtimeErrors /></body>
    </html>
  )
}
