import Link from 'next/link'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: {
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-6" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">{subtitle}</p>
      {ctaLabel && ctaHref && (
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
      {ctaLabel && onCtaClick && <Button onClick={onCtaClick}>{ctaLabel}</Button>}
    </div>
  )
}
