'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PLATFORM } from '@/lib/platform-info'

interface DashboardShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function DashboardShell({ sidebar, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static on lg */}
      <div
        className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-auto lg:shrink-0 transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3.5 right-3 z-10 lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-border transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar with hamburger */}
        <div className="lg:hidden flex items-center h-14 px-4 gap-3 bg-bg-card border-b border-bg-border shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-border transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="w-4 h-4 rounded" />
            </div>
            <span className="font-bold text-text-primary text-sm">{PLATFORM.name}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
