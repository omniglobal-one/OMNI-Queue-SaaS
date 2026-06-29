'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-border'
      }`}
    >
      <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
      {item.label}
    </Link>
  )
}

const merchantNav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Queues',
    href: '/dashboard/queues',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h12M2 8h8M2 12h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'New Queue',
    href: '/dashboard/queues/new',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v6M5 8h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" strokeLinecap="round" />
      </svg>
    ),
  },
]

const adminNav: NavItem[] = [
  {
    label: 'Admin',
    href: '/admin',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z" />
      </svg>
    ),
  },
]

export function Sidebar({ role }: { role: 'merchant' | 'admin' }) {
  const nav = role === 'admin' ? [...merchantNav, ...adminNav] : merchantNav

  return (
    <aside className="w-56 flex-shrink-0 bg-bg-card border-r border-bg-border flex flex-col py-4 px-2">
      <nav className="flex flex-col gap-1 flex-1">
        <p className="section-title px-3 mb-2">Menu</p>
        {nav.map(item => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  )
}
