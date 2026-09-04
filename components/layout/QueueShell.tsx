'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar, BottomTabNav, type NavDestination } from '@omni/ui'
import { signOut } from '@/app/actions/auth'
import { PLATFORM } from '@/lib/platform-info'
import type { Role } from '@/types'

interface NavItem {
  label: string
  href: string
  exact: boolean
  icon: ReactNode
}

const merchantNav: NavItem[] = [
  {
    label: 'Dashboard', href: '/dashboard', exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Queues', href: '/dashboard/queues', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    label: 'New Queue', href: '/dashboard/queues/new', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Settings', href: '/dashboard/settings', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

const adminNav: NavItem[] = [
  {
    label: 'Admin', href: '/admin', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

function getRoleLabel(role: Role): string {
  return role === 'admin' ? 'Platform Admin' : 'Merchant'
}

function toDestination(item: NavItem, pathname: string): NavDestination {
  return {
    key: item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
    active: item.exact ? pathname === item.href : pathname.startsWith(item.href),
  }
}

const renderLink = (dest: NavDestination, children: ReactNode) => (
  <Link key={dest.key} href={dest.href}>
    {children}
  </Link>
)

interface QueueShellProps {
  role: Role
  userEmail: string
  userName?: string | null | undefined
  children: ReactNode
}

function QueueSidebarDesktop({ role, userEmail, userName }: Omit<QueueShellProps, 'children'>) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = role === 'admin' ? adminNav : merchantNav
  const destinations = navItems.map((item) => toDestination(item, pathname))

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Sidebar
      destinations={destinations}
      renderLink={renderLink}
      productName={PLATFORM.name}
      productLogo={
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-accent">
          <Image src="/icon.png" alt="" width={20} height={20} className="rounded-sm" />
        </div>
      }
      footer={
        <div>
          <div className="flex justify-center lg:hidden">
            <button type="button" onClick={handleSignOut} aria-label="Sign out" className="flex h-9 w-9 items-center justify-center rounded-sm text-omni-ink-soft hover:bg-omni-surface-sunk hover:text-omni-ink">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
          <div className="hidden lg:block">
            <p className="truncate px-1 text-small font-semibold text-omni-ink">{userName ?? 'User'}</p>
            <p className="truncate px-1 text-caption text-omni-ink-faint">{userEmail}</p>
            <p className="mt-1 truncate px-1 text-caption text-omni-ink-faint">{getRoleLabel(role)}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 flex h-9 w-full items-center gap-2 rounded-sm px-3 text-small font-semibold text-omni-ink-soft hover:bg-omni-surface-sunk hover:text-omni-ink"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      }
    />
  )
}

function QueueBottomNav({ role }: Pick<QueueShellProps, 'role'>) {
  const pathname = usePathname()
  const navItems = role === 'admin' ? adminNav : merchantNav
  return <BottomTabNav destinations={navItems.map((item) => toDestination(item, pathname))} renderLink={renderLink} />
}

export function QueueShell({ role, userEmail, userName, children }: QueueShellProps) {
  return (
    <div className="flex h-screen bg-omni-bg">
      <QueueSidebarDesktop role={role} userEmail={userEmail} userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">{children}</main>
      </div>
      <QueueBottomNav role={role} />
    </div>
  )
}
