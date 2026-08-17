'use server'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/security'

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  // Rate limit: 10 login attempts per IP per minute. Login previously ran entirely client-side
  // with no backstop of its own against credential stuffing.
  const ip = getClientIp(await headers())
  const admin = createAdminClient()
  const { data: allowed } = await admin.rpc('check_rate_limit', {
    p_key: `sign_in:${ip}`, p_max_count: 10, p_window_seconds: 60,
  })
  if (allowed === false) return { error: 'Too many attempts. Please wait a minute and try again.' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Invalid email or password. Please try again.' }
  return {}
}

export async function signOut(): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { error: 'Sign out failed. Please try again.' }
  return {}
}

// Hands the browser client a short-lived access token for Realtime channel auth / authenticated
// REST calls, without ever exposing the refresh token (which stays in the httpOnly session
// cookie, server-only). getSession() (not getUser()) is used deliberately here — it's the only
// call that returns the raw token string; the caller only uses it for outbound requests that
// Supabase itself will authorize, so a non-revalidated read is fine.
export async function getRealtimeAccessToken(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
