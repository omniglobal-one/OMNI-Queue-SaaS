import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { JoinQueueForm } from './JoinQueueForm'
import { PasscodeGate } from '@/components/customer/PasscodeGate'
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
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-bg-border rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-semibold text-text-primary mb-2">Queue Closed</h1>
          <p className="text-text-tertiary text-sm">{queue.name} at {businessName} is currently closed. Please come back later.</p>
        </div>
      </div>
    )
  }

  if (!queue.is_accepting) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <h1 className="font-semibold text-text-primary mb-2">Queue Full</h1>
          <p className="text-text-tertiary text-sm">No more tickets are being accepted right now. Please check back later.</p>
        </div>
      </div>
    )
  }

  if (queue.status === 'paused') {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </div>
          <h1 className="font-semibold text-text-primary mb-2">Queue Paused</h1>
          <p className="text-text-tertiary text-sm">{queue.name} is temporarily paused. You can still join but service is on hold.</p>
          <div className="mt-4">
            <JoinQueueForm queue={queue} businessName={businessName} />
          </div>
        </div>
      </div>
    )
  }

  const joinForm = (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="w-10 h-10 rounded-xl mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-text-primary">{queue.name}</h1>
          <p className="text-text-tertiary text-sm mt-1">{businessName} · {PLATFORM.name}</p>
        </div>
        <JoinQueueForm queue={queue} businessName={businessName} />
      </div>
    </div>
  )

  if (!queue.passcode) return joinForm

  return (
    <PasscodeGate
      queueId={queue.id}
      queueSlug={queue.slug}
      queueName={queue.name}
      businessName={businessName}
    >
      {joinForm}
    </PasscodeGate>
  )
}
