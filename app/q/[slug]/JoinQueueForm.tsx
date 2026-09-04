'use client'

import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Input } from '@omni/ui'
import { joinQueue } from '@/app/actions/tickets'
import type { Queue } from '@/types'

const ERROR_MESSAGES: Record<string, string> = {
  QUEUE_NOT_ACCEPTING: 'This queue is not accepting new tickets right now.',
  QUEUE_FULL: 'Queue is full. Please check back later.',
  DUPLICATE_INVOICE: 'This invoice number is already in the queue.',
  PASSCODE_REQUIRED: 'Passcode required. Please refresh and enter the queue passcode.',
}

export function JoinQueueForm({ queue, businessName }: { queue: Queue; businessName: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [invoice, setInvoice] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleJoin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    // The gate stores a short-lived signed unlock token, never the raw passcode — see
    // components/customer/PasscodeGate.tsx and lib/security.ts.
    const unlockToken = sessionStorage.getItem(`queue_unlock_token_${queue.id}`) ?? undefined
    startTransition(async () => {
      const result = await joinQueue({
        queue_slug: queue.slug,
        ...(unlockToken ? { unlock_token: unlockToken } : {}),
        ...(name ? { customer_name: name } : {}),
        ...(phone ? { customer_phone: phone } : {}),
        ...(queue.mode === 'invoice' && invoice ? { invoice_number: invoice } : {}),
      })
      if ('error' in result) {
        setError(ERROR_MESSAGES[result.error] ?? result.error)
      } else {
        router.push(`/q/${queue.slug}/ticket/${result.ticket_id}`)
      }
    })
  }

  return (
    <div className="rounded-md border border-omni-border bg-omni-surface p-6">
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        {queue.mode === 'invoice' && (
          <Input
            label="Invoice / Reference Number *"
            value={invoice}
            onChange={e => setInvoice(e.target.value)}
            placeholder="e.g. INV-0012"
            required
          />
        )}
        <Input
          label="Your Name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Ahmad"
        />
        <div>
          <Input
            label="WhatsApp Number (optional)"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+60123456789"
          />
          <p className="text-xs text-omni-ink-faint mt-1">Staff may WhatsApp you when it&apos;s your turn. Enable browser notifications on the next page for an automatic alert.</p>
        </div>
        {error !== null && <Alert tone="error">{error}</Alert>}
        <Button type="submit" disabled={isPending} className="w-full h-11 justify-center">
          {isPending ? 'Joining…' : 'Join Queue'}
        </Button>
      </form>
    </div>
  )
}
