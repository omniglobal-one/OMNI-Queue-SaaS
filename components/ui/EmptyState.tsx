import Link from 'next/link'

interface EmptyStateProps {
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  variant?: 'default' | 'error'
}

export function EmptyState({ title, subtitle, ctaLabel, ctaHref, onCtaClick, variant = 'default' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4">
        {variant === 'error' ? (
          <svg className="w-16 h-16 text-bg-border mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ) : (
          <svg className="w-16 h-16 text-bg-border mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-xs">{subtitle}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary">{ctaLabel}</Link>
      )}
      {ctaLabel && onCtaClick && (
        <button onClick={onCtaClick} className="btn-primary">{ctaLabel}</button>
      )}
    </div>
  )
}
