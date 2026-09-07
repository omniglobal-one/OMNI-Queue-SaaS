import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
    <Card className={cn(highlight && 'border-primary/30')}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className={cn('text-3xl font-semibold tabular-nums tracking-tight', highlight && 'text-primary')}>
          {value}
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
