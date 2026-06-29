import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`stat-card ${highlight ? 'border-primary/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        {icon && <span className="text-text-tertiary">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-text-primary'}`}>
        {value}
      </div>
      {sub && <p className="text-xs text-text-tertiary mt-1">{sub}</p>}
    </div>
  )
}
