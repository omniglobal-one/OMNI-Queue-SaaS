import { createAdminClient } from '@/lib/supabase/admin'
import { renderQueueCardPng } from '@/lib/qr-card-renderer'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const queueId = searchParams.get('id')
  if (!queueId) return new Response('Missing id', { status: 400 })

  const admin = createAdminClient()
  const { data: queue } = await admin.from('queues').select('name, slug').eq('id', queueId).single()
  if (!queue) return new Response('Queue not found', { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://omniqueue.app'

  const png = await renderQueueCardPng({
    queueName: queue.name,
    queueSlug: queue.slug,
    appUrl,
  })

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${queue.slug}-queue-card.png"`,
    },
  })
}
