'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, LayoutDashboard, ListOrdered, PlusCircle, Settings, ShieldCheck, LogOut } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/actions/auth'
import { getInitials } from '@/lib/utils'
import type { Role } from '@/types'

const MERCHANT_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/queues', label: 'Queues', icon: ListOrdered },
  { href: '/dashboard/queues/new', label: 'New Queue', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const ADMIN_NAV = [{ href: '/admin', label: 'Admin', icon: ShieldCheck }]

function getRoleLabel(role: Role): string {
  return role === 'admin' ? 'Platform Admin' : 'Merchant'
}

export function QueueShell({
  role,
  userEmail,
  userName,
  children,
}: {
  role: Role
  userEmail: string
  userName?: string | null | undefined
  children: ReactNode
}) {
  const router = useRouter()
  const nav = role === 'admin' ? ADMIN_NAV : MERCHANT_NAV

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {nav.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon className="size-4" /> {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserMenu role={role} userEmail={userEmail} userName={userName} onSignOut={handleSignOut} />
        </header>
        <div className="hidden justify-end border-b border-border/70 px-6 py-2.5 md:flex">
          <UserMenu role={role} userEmail={userEmail} userName={userName} onSignOut={handleSignOut} />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function UserMenu({
  role,
  userEmail,
  userName,
  onSignOut,
}: {
  role: Role
  userEmail: string
  userName?: string | null | undefined
  onSignOut: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-80">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {getInitials(userName || userEmail)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium">{userName ?? 'User'}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{userEmail}</p>
          <Badge variant="secondary" className="mt-2">
            {getRoleLabel(role)}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
