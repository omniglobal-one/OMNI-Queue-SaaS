import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function buildCsp(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '*.supabase.co'
  const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : 'wss://*.supabase.co'

  return [
    "default-src 'self'",
    // 'strict-dynamic' lets Next.js's own nonce'd runtime/chunk scripts load further scripts
    // without each needing its own nonce. unsafe-inline/unsafe-eval are dropped from the
    // shipped policy — they were previously present even in production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Inline style ATTRIBUTES cannot be nonce'd — CSP nonces only apply to <style>/<script>
    // elements, not the style="" attribute — so this stays unsafe-inline.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self'",
    `connect-src 'self' https://${supabaseHost} ${supabaseWss} https://wa.me`,
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next.js's own renderer reads the nonce back out of the CSP header on the *request* object
  // (not just the response) to know what nonce to stamp onto its own script tags — without
  // this, the response's CSP would demand a nonce that no script tag actually carries, and
  // every script on the site would be blocked.
  requestHeaders.set('Content-Security-Policy', csp)

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  function withCsp(res: NextResponse): NextResponse {
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, secure: true } as never)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Always-public routes — queue join, ticket view, API
  if (
    pathname === '/' ||
    pathname.startsWith('/q/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/privacy')
  ) {
    if (user && (pathname === '/' || pathname.startsWith('/login'))) {
      return withCsp(NextResponse.redirect(new URL('/dashboard', request.url)))
    }
    return withCsp(supabaseResponse)
  }

  // All other routes require auth
  if (!user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectTo', pathname)
    return withCsp(NextResponse.redirect(url))
  }

  // Admin guard
  if (pathname.startsWith('/admin')) {
    const { data: raw } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = (raw as { role: string } | null)?.role
    if (role !== 'admin') {
      return withCsp(NextResponse.redirect(new URL('/dashboard', request.url)))
    }
  }

  return withCsp(supabaseResponse)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
