'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, PlusCircle, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLATFORM } from '@/lib/platform-info'
import type { Role } from '@/types'

const MERCHANT_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/queues', label: 'Queues', icon: ListOrdered },
  { href: '/dashboard/queues/new', label: 'New Queue', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const ADMIN_NAV = [{ href: '/admin', label: 'Admin', icon: ShieldCheck, exact: true }]

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const nav = role === 'admin' ? ADMIN_NAV : MERCHANT_NAV

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/70 bg-muted/20 md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border/70 px-5">
        <Image src="/icon.png" alt="" width={24} height={24} className="rounded-md" />
        <span className="text-sm font-semibold tracking-tight">{PLATFORM.name}</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="size-[17px]" strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
