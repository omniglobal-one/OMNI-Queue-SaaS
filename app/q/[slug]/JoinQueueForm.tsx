'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinQueue } from '@/app/actions/tickets'
import { Button } from '@/components/ui/Button'
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

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const passcode = sessionStorage.getItem(`queue_passcode_${queue.id}`) ?? undefined
    startTransition(async () => {
      const result = await joinQueue({
        queue_slug: queue.slug,
        ...(passcode ? { passcode } : {}),
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
    <div className="card p-6">
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        {queue.mode === 'invoice' && (
          <div>
            <label htmlFor="invoice" className="label">Invoice / Reference Number *</label>
            <input
              id="invoice"
              className="input"
              value={invoice}
              onChange={e => setInvoice(e.target.value)}
              placeholder="e.g. INV-0012"
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="name" className="label">Your Name (optional)</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ahmad"
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">WhatsApp Number (optional)</label>
          <input
            id="phone"
            type="tel"
            className="input"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+60123456789"
          />
          <p className="text-xs text-text-tertiary mt-1">We&apos;ll send you WhatsApp updates when it&apos;s your turn.</p>
        </div>
        {error && <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}
        <Button type="submit" loading={isPending} className="w-full h-11">
          Join Queue
        </Button>
      </form>
    </div>
  )
}
