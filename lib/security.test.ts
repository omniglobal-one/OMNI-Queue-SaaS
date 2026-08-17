import { describe, it, expect, vi } from 'vitest'

// signUnlockToken/verifyUnlockToken derive their HMAC key from this env var — tests run
// against a fixed dummy value, never the real production secret. Read lazily inside the
// functions under test, so setting it here (before any test calls them) is sufficient
// regardless of import order.
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-only-dummy-service-role-key'

import { constantTimeEquals, isValidPushEndpoint, getClientIp, signUnlockToken, verifyUnlockToken } from './security'

describe('getClientIp', () => {
  it('prefers x-vercel-forwarded-for over x-forwarded-for', () => {
    const h = new Headers({ 'x-vercel-forwarded-for': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' })
    expect(getClientIp(h)).toBe('1.1.1.1')
  })

  it('falls back to x-forwarded-for when the Vercel header is absent', () => {
    const h = new Headers({ 'x-forwarded-for': '2.2.2.2' })
    expect(getClientIp(h)).toBe('2.2.2.2')
  })

  it('takes the first IP in a comma-separated forwarding chain', () => {
    const h = new Headers({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3, 4.4.4.4' })
    expect(getClientIp(h)).toBe('2.2.2.2')
  })

  it('falls back to x-real-ip, then "unknown"', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '5.5.5.5' }))).toBe('5.5.5.5')
    expect(getClientIp(new Headers())).toBe('unknown')
  })
})

describe('constantTimeEquals', () => {
  it('returns true for an exact match', () => {
    expect(constantTimeEquals('1234', '1234')).toBe(true)
  })

  it('rejects a wrong passcode of the same length', () => {
    expect(constantTimeEquals('1234', '1235')).toBe(false)
  })

  it('rejects a passcode that differs only in length', () => {
    expect(constantTimeEquals('1234', '123')).toBe(false)
    expect(constantTimeEquals('1234', '12345')).toBe(false)
  })

  it('rejects an empty guess against a real passcode', () => {
    expect(constantTimeEquals('1234', '')).toBe(false)
  })

  it('correctly rejects a near-miss that differs only in the last digit', () => {
    expect(constantTimeEquals('1234', '1235')).toBe(false)
  })
})

describe('signUnlockToken / verifyUnlockToken', () => {
  it('a freshly signed token verifies for the same queue', () => {
    const token = signUnlockToken('cafe-aroma-orders')
    expect(verifyUnlockToken('cafe-aroma-orders', token)).toBe(true)
  })

  it('rejects a token presented for a different queue', () => {
    const token = signUnlockToken('cafe-aroma-orders')
    expect(verifyUnlockToken('kl-auto-service', token)).toBe(false)
  })

  it('rejects a tampered token', () => {
    const token = signUnlockToken('cafe-aroma-orders')
    const tampered = token.slice(0, -1) + (token.at(-1) === 'A' ? 'B' : 'A')
    expect(verifyUnlockToken('cafe-aroma-orders', tampered)).toBe(false)
  })

  it('rejects a malformed token', () => {
    expect(verifyUnlockToken('cafe-aroma-orders', 'not-a-real-token')).toBe(false)
    expect(verifyUnlockToken('cafe-aroma-orders', '')).toBe(false)
  })

  it('rejects an expired token', () => {
    vi.useFakeTimers()
    try {
      const token = signUnlockToken('cafe-aroma-orders')
      expect(verifyUnlockToken('cafe-aroma-orders', token)).toBe(true)
      vi.advanceTimersByTime(16 * 60 * 1000) // past the 15-minute TTL
      expect(verifyUnlockToken('cafe-aroma-orders', token)).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('isValidPushEndpoint — SSRF allowlist', () => {
  it('accepts real push service endpoints', () => {
    expect(isValidPushEndpoint('https://fcm.googleapis.com/fcm/send/abc123')).toBe(true)
    expect(isValidPushEndpoint('https://android.googleapis.com/gcm/send/abc123')).toBe(true)
    expect(isValidPushEndpoint('https://updates.push.services.mozilla.com/wpush/v2/abc')).toBe(true)
    expect(isValidPushEndpoint('https://web.push.apple.com/QAbc123')).toBe(true)
  })

  it('rejects internal/private network targets', () => {
    expect(isValidPushEndpoint('http://169.254.169.254/latest/meta-data/')).toBe(false)
    expect(isValidPushEndpoint('https://169.254.169.254/latest/meta-data/')).toBe(false)
    expect(isValidPushEndpoint('https://localhost/admin')).toBe(false)
    expect(isValidPushEndpoint('https://127.0.0.1:8080/')).toBe(false)
    expect(isValidPushEndpoint('https://internal-service.local/')).toBe(false)
  })

  it('rejects non-https schemes even against an allowlisted host', () => {
    expect(isValidPushEndpoint('http://fcm.googleapis.com/fcm/send/abc123')).toBe(false)
  })

  it('rejects a hostname that merely contains an allowlisted host as a substring', () => {
    // e.g. "fcm.googleapis.com.attacker.example" must NOT match the googleapis.com suffix rule
    expect(isValidPushEndpoint('https://fcm.googleapis.com.attacker.example/x')).toBe(false)
    expect(isValidPushEndpoint('https://notgoogleapis.com/x')).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(isValidPushEndpoint('not-a-url')).toBe(false)
    expect(isValidPushEndpoint('')).toBe(false)
  })
})
