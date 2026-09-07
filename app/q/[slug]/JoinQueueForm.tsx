'use client'

import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { joinQueue } from '@/app/actions/tickets'
import type { Queue } from '@/types'

const ERROR_MESSAGES: Record<string, string> = {
  QUEUE_NOT_ACCEPTING: 'This queue is not accepting new tickets right now.',
  QUEUE_FULL: 'Queue is full. Please check back later.',
  DUPLICATE_INVOICE: 'This invoice number is already in the queue.',
  PASSCODE_REQUIRED: 'Passcode required. Please refresh and enter the queue passcode.',
}

export function JoinQueueForm({ queue }: { queue: Queue; businessName: string }) {
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
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          {queue.mode === 'invoice' && (
            <div className="space-y-2">
              <Label htmlFor="invoice">Invoice / Reference Number *</Label>
              <Input
                id="invoice"
                value={invoice}
                onChange={e => setInvoice(e.target.value)}
                placeholder="e.g. INV-0012"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Your Name (optional)</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmad" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number (optional)</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60123456789" />
            <p className="text-xs text-muted-foreground">
              Staff may WhatsApp you when it&apos;s your turn. Enable browser notifications on the next page for an automatic alert.
            </p>
          </div>
          {error !== null && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={isPending} className="h-11 w-full">
            {isPending && <Loader2 className="size-4 animate-spin" />} {isPending ? 'Joining…' : 'Join Queue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
