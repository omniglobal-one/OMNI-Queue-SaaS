'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import { Loader2, KeyRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { verifyQueuePasscode } from '@/app/actions/queues'
import { PLATFORM } from '@/lib/platform-info'

// Stores the short-lived server-signed unlock token (see lib/security.ts), never the raw
// passcode — the browser no longer needs to hold the actual 4-digit secret. The token embeds
// its own expiry (checked client-side only to decide whether to show the gate again; the
// server independently re-verifies the signature and expiry at joinQueue time regardless).
const UNLOCK_TOKEN_KEY = (queueId: string) => `queue_unlock_token_${queueId}`

function readUnverifiedTokenExpiry(token: string): number | null {
  const expiresStr = token.split('.')[0]
  const expires = expiresStr ? Number(expiresStr) : NaN
  return Number.isFinite(expires) ? expires : null
}

export function PasscodeGate({
  queueId,
  queueSlug,
  queueName,
  businessName,
  children,
}: {
  queueId: string
  queueSlug: string
  queueName: string
  businessName: string
  children: ReactNode
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const focus = (i: number) => refs[i]?.current?.focus()

  useEffect(() => {
    const existing = sessionStorage.getItem(UNLOCK_TOKEN_KEY(queueId))
    const expires = existing ? readUnverifiedTokenExpiry(existing) : null
    if (expires !== null && expires > Date.now()) {
      setUnlocked(true)
    } else {
      if (existing) sessionStorage.removeItem(UNLOCK_TOKEN_KEY(queueId))
      focus(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId])

  async function handleVerify(code: string) {
    setLoading(true)
    setError(null)
    const { success, unlockToken } = await verifyQueuePasscode({ queue_slug: queueSlug, passcode: code })
    setLoading(false)
    if (success) {
      if (unlockToken) sessionStorage.setItem(UNLOCK_TOKEN_KEY(queueId), unlockToken)
      setUnlocked(true)
    } else {
      setError('Incorrect passcode. Please try again.')
      setDigits(['', '', '', ''])
      focus(0)
    }
  }

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? digit : d))
    setDigits(next)
    setError(null)

    if (digit && index < 3) focus(index + 1)

    if (digit && index === 3) {
      const code = next.join('')
      if (code.length === 4) handleVerify(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) focus(index - 1)
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      setDigits(pasted.split(''))
      focus(3)
      handleVerify(pasted)
    }
    e.preventDefault()
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary">
            <Image src="/icon.png" alt="" width={28} height={28} className="rounded-lg" />
          </div>
          <h1 className="text-xl font-semibold">{queueName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{businessName} · {PLATFORM.name}</p>
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                <KeyRound className="size-[18px] text-muted-foreground" />
              </div>
              <p className="pt-1 text-sm font-medium">Enter passcode to join</p>
              <p className="text-xs text-muted-foreground">Ask staff for the 4-digit code.</p>
            </div>

            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                  className={cn(
                    'size-14 rounded-xl border-2 bg-background text-center text-2xl font-bold outline-none transition-colors',
                    error ? 'border-destructive' : d ? 'border-primary' : 'border-input focus:border-primary'
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">{error}</p>
            )}

            {loading && (
              <div className="flex justify-center">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
