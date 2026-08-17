import crypto from 'crypto'

// Vercel's edge overwrites x-forwarded-for and never forwards a client-supplied value (see
// https://vercel.com/docs/headers/request-headers#x-forwarded-for) — it is not spoofable by a
// client when the app is only reachable through Vercel, which both OMNI apps are. Prefer
// x-vercel-forwarded-for regardless: Vercel documents it as staying authoritative even if a
// customer later puts another proxy/CDN in front of Vercel, whereas plain x-forwarded-for
// could be affected by that specific setup. Not a fix for a real spoofing hole — just the
// more future-proof header to read.
export function getClientIp(headers: Headers): string {
  return headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-real-ip')
    ?? 'unknown'
}

// Constant-time string comparison. Used for passcode checks (joinQueue, verifyQueuePasscode)
// so an attacker can't infer how many leading digits were correct from response-time
// differences. Precondition: `correct` must be non-empty — an empty string would divide by
// zero in the modulo below (queue.passcode is only ever compared when truthy at call sites).
export function constantTimeEquals(correct: string, provided: string): boolean {
  let mismatch = correct.length ^ provided.length
  for (let i = 0; i < Math.max(correct.length, provided.length); i++) {
    mismatch |= (correct.charCodeAt(i % correct.length) ^ provided.charCodeAt(i % provided.length))
  }
  return mismatch === 0
}

// Real browser push services only — the endpoint is client-supplied and the server later
// makes an outbound HTTP request to it (via web-push, when a merchant calls "next"). Without
// this allowlist, a caller could supply an internal/cloud-metadata URL and turn every
// "Call Next" click into an SSRF trigger.
const ALLOWED_PUSH_HOSTS = [
  /(^|\.)googleapis\.com$/,                  // Chrome, Edge, Opera, Samsung Internet (FCM)
  /^updates\.push\.services\.mozilla\.com$/, // Firefox
  /(^|\.)push\.apple\.com$/,                 // Safari
  /(^|\.)notify\.windows\.com$/,             // Legacy Edge (EdgeHTML)
]

export function isValidPushEndpoint(endpoint: string): boolean {
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  return ALLOWED_PUSH_HOSTS.some(re => re.test(url.hostname))
}

// Short-lived, server-signed "I already verified this queue's passcode" proof. Replaces
// storing the raw 4-digit passcode in the browser's sessionStorage for re-submission at
// joinQueue time: verifyQueuePasscode now mints one of these instead, PasscodeGate stores the
// token (not the digits), and joinQueue accepts the token as an alternative to the raw
// passcode. HMAC key material is derived from the existing Supabase service-role key via a
// domain-separated hash rather than introducing a new secret to provision — it's already a
// securely-held, server-only env var, and rotating it naturally invalidates old tokens too.
const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes — long enough to fill out the join form

function unlockTokenKey(): Buffer {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return crypto.createHash('sha256').update(`omni-queue-unlock-token:${serviceRoleKey}`).digest()
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', unlockTokenKey()).update(payload).digest('base64url')
}

export function signUnlockToken(queueSlug: string): string {
  const expires = Date.now() + TOKEN_TTL_MS
  const payload = `${queueSlug}.${expires}`
  return `${expires}.${signPayload(payload)}`
}

export function verifyUnlockToken(queueSlug: string, token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [expiresStr, sig] = parts as [string, string]
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  const expectedSig = signPayload(`${queueSlug}.${expiresStr}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
