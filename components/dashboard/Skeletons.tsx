import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function SkeletonTopbar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card px-4 py-4 sm:px-8 sm:py-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-52" />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <Card className="space-y-3 p-5">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </Card>
  )
}

function SkeletonTicketRow() {
  return (
    <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
      <Skeleton className="h-4 w-7" />
      <Skeleton className="h-4 w-16" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-12 rounded-lg" />
      </div>
    </div>
  )
}

function SkeletonQueueRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-4" />
    </div>
  )
}

export function QueueDashboardSkeleton() {
  return (
    <div>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <Card className="flex items-center gap-3 p-4">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </Card>
            <Card className="space-y-4 p-5">
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-16 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </Card>
            <Card>
              <div className="border-b border-border p-4">
                <Skeleton className="h-5 w-24" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonTicketRow key={i} />)}
            </Card>
          </div>
          <Card className="space-y-4 p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-40" />
          </Card>
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
        <Card>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonQueueRow key={i} />)}
        </Card>
      </div>
    </div>
  )
}

export function SettingsPageSkeleton() {
  return (
    <div>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="space-y-4 p-6">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
