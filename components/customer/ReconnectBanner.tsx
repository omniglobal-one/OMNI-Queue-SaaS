'use client'

export function ReconnectBanner({ isConnected }: { isConnected: boolean }) {
  if (isConnected) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center gap-2 text-yellow-700 text-sm">
      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
      Reconnecting to live queue…
    </div>
  )
}
