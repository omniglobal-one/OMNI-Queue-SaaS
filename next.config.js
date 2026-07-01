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
    // Extract hostname for CSP allowlist
    const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '*.supabase.co'
    const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : 'wss://*.supabase.co'

    const csp = [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' and 'unsafe-eval' in development;
      // in production 'unsafe-eval' is only needed by Next.js internals.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self'",
      `connect-src 'self' https://${supabaseHost} ${supabaseWss} https://wa.me`,
      "worker-src 'self'",
      // Prevent this page from being embedded in an iframe anywhere
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
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

module.exports = nextConfig
