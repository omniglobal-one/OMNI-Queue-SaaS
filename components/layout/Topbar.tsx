import type { ReactNode } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-omni-border bg-omni-surface px-4 py-4 sm:px-8 sm:py-5">
      <div className="min-w-0">
        <h1 className="font-display text-h1 font-semibold text-omni-ink sm:text-h1-lg">{title}</h1>
        {subtitle !== undefined && <p className="mt-0.5 text-small text-omni-ink-soft">{subtitle}</p>}
      </div>
      {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
