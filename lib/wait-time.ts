export function calculateWaitTime({
  pendingAhead,
  avgServiceMinutes,
  manualDelayMinutes,
}: {
  pendingAhead: number
  avgServiceMinutes: number
  manualDelayMinutes: number
}): number {
  const estimated = pendingAhead * avgServiceMinutes + manualDelayMinutes
  return Math.max(0, Math.round(estimated))
}

export function formatWaitTime(minutes: number): string {
  if (minutes === 0) return "You're next"
  if (minutes < 60) return `${minutes} mins`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
