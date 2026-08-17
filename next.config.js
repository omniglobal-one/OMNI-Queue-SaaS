/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '*.supabase.co'
    const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : 'wss://*.supabase.co'

    // A nonce-based CSP (dropping 'unsafe-inline' from script-src) was attempted and reverted:
    // Next.js's automatic nonce-application to its own framework scripts could not be verified
    // as actually working in this environment (no browser available to confirm hydration
    // wasn't broken by 'strict-dynamic' rejecting un-nonced script tags), and shipping an
    // unverifiable change with site-wide-breakage blast radius was judged worse than leaving
    // this specific low-severity, no-active-sink finding only partially addressed. 'unsafe-eval'
    // — which IS safe to drop unconditionally, no nonce required — is removed from production.
    const csp = [
      "default-src 'self'",
      process.env.NODE_ENV === 'development'
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self'",
      `connect-src 'self' https://${supabaseHost} ${supabaseWss} https://wa.me`,
      "worker-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

module.exports = nextConfig
