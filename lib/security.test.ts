import { describe, it, expect } from 'vitest'
import { constantTimeEquals, isValidPushEndpoint } from './security'

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
