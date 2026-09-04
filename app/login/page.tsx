'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Alert } from '@omni/ui'
import { signIn } from '@/app/actions/auth'
import { PLATFORM } from '@/lib/platform-info'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authErr } = await signIn(email, password)

    if (authErr) {
      setError(authErr)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-omni-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-accent">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="h-5 w-5 rounded-sm" />
          </div>
          <span className="font-mono text-caption uppercase tracking-wide text-omni-ink-faint">
            {PLATFORM.name}
          </span>
        </div>
        <h1 className="font-display text-h1-lg font-semibold text-omni-ink">Welcome back</h1>
        <p className="mt-2 text-body text-omni-ink-soft">Sign in to your account to continue</p>

        <div className="mt-6 rounded-md border border-omni-border bg-omni-surface p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error !== null && <Alert tone="error">{error}</Alert>}
            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-contrast/30 border-t-accent-contrast" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <p className="hidden mt-6 text-center text-small text-omni-ink-faint">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-omni-ink hover:underline">Create one</Link>
        </p>
        <p className="mt-2 text-center text-small text-omni-ink-faint">{PLATFORM.name} — {PLATFORM.tagline}</p>
        <p className="mt-2 text-center text-caption text-omni-ink-faint">
          <Link href="/privacy" className="hover:underline">Privacy Policy &amp; Terms of Use</Link>
        </p>
      </div>
    </div>
  )
}
