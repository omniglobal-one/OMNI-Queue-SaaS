import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { renderQueueCardPng } from '@/lib/qr-card-renderer'

export async function GET(req: Request) {
  // Require authentication
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const queueId = searchParams.get('id')
  if (!queueId) return new Response('Missing id', { status: 400 })

  const admin = createAdminClient()

  // Verify user is the queue owner or an admin
  const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = (profileRaw as { role: string } | null)?.role === 'admin'

  const { data: queue } = await admin.from('queues').select('name, slug, merchant_id').eq('id', queueId).single()
  if (!queue) return new Response('Queue not found', { status: 404 })

  if (!isAdmin && (queue as { merchant_id: string }).merchant_id !== user.id) {
    return new Response('Forbidden', { status: 403 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://queue.omnidesk.one'

  const png = await renderQueueCardPng({
    queueName: queue.name,
    queueSlug: queue.slug,
    appUrl,
  })

  // Sanitize slug before embedding in Content-Disposition header to prevent header injection
  const safeSlug = queue.slug.replace(/[^a-z0-9-]/gi, '-').slice(0, 60)

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${safeSlug}-queue-card.png"`,
    },
  })
}
