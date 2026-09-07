'use client'

import { useState, useTransition } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { updateCustomerPhone } from '@/app/actions/tickets'

export function PhoneAddForm({ ticketId, currentPhone }: { ticketId: string; currentPhone: string | null }) {
  const [phone, setPhone] = useState(currentPhone ?? '')
  const [saved, setSaved] = useState(!!currentPhone)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    if (!phone.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await updateCustomerPhone({ ticket_id: ticketId, phone })
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  if (saved) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
        <WhatsAppIcon className="size-[18px] shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs leading-none text-muted-foreground">WhatsApp updates sent to</p>
          <p className="font-mono text-sm font-semibold">{phone}</p>
        </div>
        <button
          onClick={() => setSaved(false)}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3" /> Edit
        </button>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Label className="mb-1.5 block">WhatsApp number (optional)</Label>
        <div className="flex gap-2">
          <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60123456789" className="flex-1" />
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Include country code. We&apos;ll send WhatsApp updates to this number.</p>
      </CardContent>
    </Card>
  )
}
