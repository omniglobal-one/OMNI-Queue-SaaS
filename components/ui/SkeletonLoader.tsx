import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  width?: string
  height?: string
  shape?: 'rect' | 'circle' | 'text'
  className?: string
}

export function SkeletonLoader({
  width = 'w-full',
  height = 'h-4',
  shape = 'rect',
  className,
}: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        'skeleton',
        width,
        height,
        shape === 'circle' && 'rounded-full',
        shape === 'text' && 'rounded',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <SkeletonLoader height="h-4" width="w-20" />
      <SkeletonLoader height="h-8" width="w-16" />
      <SkeletonLoader height="h-3" width="w-24" />
    </div>
  )
}

export function SkeletonTopbar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-bg-border bg-bg-card">
      <div className="space-y-2">
        <SkeletonLoader height="h-7" width="w-40" />
        <SkeletonLoader height="h-4" width="w-52" />
      </div>
    </div>
  )
}

export function SkeletonTicketRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-border/50">
      <SkeletonLoader width="w-7" height="h-4" />
      <SkeletonLoader width="w-16" height="h-4" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLoader height="h-4" width="w-32" />
        <SkeletonLoader height="h-3" width="w-24" />
      </div>
      <div className="flex gap-2">
        <SkeletonLoader height="h-7" width="w-16" className="rounded-lg" />
        <SkeletonLoader height="h-7" width="w-12" className="rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonQueueRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 border-b border-bg-border last:border-b-0">
      <div className="flex-1 space-y-1.5">
        <SkeletonLoader height="h-5" width="w-40" />
        <SkeletonLoader height="h-3" width="w-56" />
      </div>
      <SkeletonLoader height="h-5" width="w-16" className="rounded-full" />
      <SkeletonLoader height="h-4" width="w-4" />
    </div>
  )
}

export function QueueDashboardSkeleton() {
  return (
    <div>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex flex-col gap-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
            {/* Queue controls bar */}
            <div className="card p-4 flex items-center gap-3">
              <SkeletonLoader height="h-9" width="w-28" className="rounded-lg" />
              <SkeletonLoader height="h-9" width="w-24" className="rounded-lg" />
            </div>
            {/* Currently serving */}
            <div className="card p-5 space-y-4">
              <SkeletonLoader height="h-4" width="w-28" />
              <div className="flex items-center gap-4">
                <SkeletonLoader width="w-16" height="h-16" className="rounded-xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonLoader height="h-5" width="w-36" />
                  <SkeletonLoader height="h-3" width="w-28" />
                </div>
              </div>
              <div className="flex gap-2">
                <SkeletonLoader height="h-9" width="w-24" className="rounded-lg" />
                <SkeletonLoader height="h-9" width="w-16" className="rounded-lg" />
                <SkeletonLoader height="h-9" width="w-24" className="rounded-lg" />
              </div>
            </div>
            {/* Waiting list */}
            <div className="card">
              <div className="p-4 border-b border-bg-border">
                <SkeletonLoader height="h-5" width="w-24" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonTicketRow key={i} />)}
            </div>
          </div>
          {/* QR card */}
          <div className="card p-5 space-y-4">
            <SkeletonLoader height="h-5" width="w-32" />
            <SkeletonLoader width="w-full" height="h-48" className="rounded-lg" />
            <SkeletonLoader height="h-4" width="w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function QueueListSkeleton() {
  return (
    <div>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="card">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonQueueRow key={i} />)}
        </div>
      </div>
    </div>
  )
}

export function SettingsPageSkeleton() {
  return (
    <div>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 space-y-4">
              <SkeletonLoader height="h-5" width="w-32" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between py-2 border-b border-bg-border last:border-b-0">
                  <SkeletonLoader height="h-4" width="w-28" />
                  <SkeletonLoader height="h-4" width="w-20" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
