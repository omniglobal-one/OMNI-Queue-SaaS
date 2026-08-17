import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            // httpOnly: this is the durable session (refresh token included) — it must never be
            // readable by JS. The browser Supabase client (lib/supabase/client.ts) no longer
            // persists or reads its own session cookie; anything the client needs (a short-lived
            // access token for Realtime/REST) is handed to it explicitly via a server action
            // instead, so it never depends on reading this cookie.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, secure: true, httpOnly: true })
            )
          } catch {}
        },
      },
    }
  )
}
