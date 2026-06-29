'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM } from '@/lib/platform-info'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
            </div>
            <span className="text-xl font-bold text-text-primary">{PLATFORM.name}</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary mt-1">Sign in to your merchant account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error !== null && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-danger text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-tertiary text-sm mt-6">{PLATFORM.name} — {PLATFORM.tagline}</p>
        <p className="text-center text-xs text-text-tertiary mt-2">
          <Link href="/privacy" className="hover:underline">Privacy Policy &amp; Terms of Use</Link>
        </p>
      </div>
    </div>
  )
}
