'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { verifyQueuePasscode } from '@/app/actions/queues'
import { PLATFORM } from '@/lib/platform-info'

const SESSION_KEY = (queueId: string) => `queue_access_${queueId}`
const PASSCODE_KEY = (queueId: string) => `queue_passcode_${queueId}`

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
    if (sessionStorage.getItem(SESSION_KEY(queueId)) === '1') {
      setUnlocked(true)
    } else {
      focus(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId])

  async function handleVerify(code: string) {
    setLoading(true)
    setError(null)
    const { success } = await verifyQueuePasscode({ queue_slug: queueSlug, passcode: code })
    setLoading(false)
    if (success) {
      sessionStorage.setItem(SESSION_KEY(queueId), '1')
      sessionStorage.setItem(PASSCODE_KEY(queueId), code)
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
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">{queueName}</h1>
          <p className="text-text-tertiary text-sm mt-1">{businessName} · {PLATFORM.name}</p>
        </div>

        <div className="card p-6 space-y-5">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-bg-border flex items-center justify-center mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary pt-1">Enter passcode to join</p>
            <p className="text-xs text-text-tertiary">Ask staff for the 4-digit code.</p>
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
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-bg-base text-text-primary outline-none transition-colors
                  ${error ? 'border-danger' : d ? 'border-primary' : 'border-bg-border focus:border-primary'}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-danger text-sm text-center bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          {loading && (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
