'use client'

export function ReconnectBanner({ isConnected }: { isConnected: boolean }) {
  if (isConnected) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-warning" />
      Reconnecting to live queue…
    </div>
  )
}
