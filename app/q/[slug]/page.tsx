import Image from 'next/image'
import { notFound } from 'next/navigation'
import { XCircle, PauseCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { JoinQueueForm } from './JoinQueueForm'
import { PasscodeGate } from '@/components/customer/PasscodeGate'
import { Card, CardContent } from '@/components/ui/card'
import type { Queue } from '@/types'
import { PLATFORM } from '@/lib/platform-info'

export default async function JoinQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: queueRaw } = await admin.from('queues').select('*').eq('slug', slug).single()
  const queue = queueRaw as Queue | null
  if (!queue) notFound()

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('business_name, logo_url')
    .eq('id', queue.merchant_id)
    .single()

  const businessName = (profileRaw as { business_name: string | null; logo_url: string | null } | null)?.business_name ?? queue.name

  if (queue.status === 'closed') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <XCircle className="size-6 text-muted-foreground" />
            </div>
            <h1 className="mb-2 font-semibold">Queue Closed</h1>
            <p className="text-sm text-muted-foreground">{queue.name} at {businessName} is currently closed. Please come back later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!queue.is_accepting) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="p-8">
            <h1 className="mb-2 font-semibold">Queue Full</h1>
            <p className="text-sm text-muted-foreground">No more tickets are being accepted right now. Please check back later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (queue.status === 'paused') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-warning/10">
              <PauseCircle className="size-6 text-warning" />
            </div>
            <h1 className="mb-2 font-semibold">Queue Paused</h1>
            <p className="text-sm text-muted-foreground">{queue.name} is temporarily paused. You can still join but service is on hold.</p>
            <div className="mt-4">
              <JoinQueueForm queue={queue} businessName={businessName} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const joinForm = (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[18px] border-2 border-primary/25 bg-primary/10 shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.5)]">
            <Image src="/icon.png" alt="" width={36} height={36} className="rounded-lg" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{queue.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{businessName} · {PLATFORM.name}</p>
        </div>
        <JoinQueueForm queue={queue} businessName={businessName} />
      </div>
    </div>
  )

  if (!queue.passcode) return joinForm

  return (
    <PasscodeGate queueId={queue.id} queueSlug={queue.slug} queueName={queue.name} businessName={businessName}>
      {joinForm}
    </PasscodeGate>
  )
}
