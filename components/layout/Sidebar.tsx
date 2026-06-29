'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM } from '@/lib/platform-info'
import type { Role } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function getRoleLabel(role: Role): string {
  return role === 'admin' ? 'Platform Admin' : 'Merchant'
}

const merchantNav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    label: 'Queues',
    href: '/dashboard/queues',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h12" />
      </svg>
    ),
  },
  {
    label: 'New Queue',
    href: '/dashboard/queues/new',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

const adminNav: NavItem[] = [
  {
    label: 'Admin',
    href: '/admin',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  role: Role
  userEmail: string
  userName?: string | null
}

export function Sidebar({ role, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = role === 'admin' ? [...merchantNav, ...adminNav] : merchantNav

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-bg-card border-r border-bg-border flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <img src="/icon.png" alt="" className="w-5 h-5 rounded" />
          </div>
          <span className="font-bold text-text-primary text-sm">{PLATFORM.name}</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-bg-border">
        <span className="text-xs text-text-tertiary">{getRoleLabel(role)}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isParent = navItems.some(other => other.href !== item.href && other.href.startsWith(item.href + '/'))
          const isActive = pathname === item.href || (!isParent && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-border'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-4 py-4 border-t border-bg-border">
        <div className="mb-3">
          <p className="text-text-primary text-sm font-medium truncate">{userName ?? 'User'}</p>
          <p className="text-text-tertiary text-xs truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="btn-ghost w-full text-xs justify-start px-2 py-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
