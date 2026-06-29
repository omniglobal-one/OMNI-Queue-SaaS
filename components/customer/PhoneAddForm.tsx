'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
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
      <div className="flex items-center gap-2 text-success text-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 4L6 11l-3-3" strokeLinecap="round" />
        </svg>
        WhatsApp updates will be sent to {phone}
        <button onClick={() => setSaved(false)} className="text-text-tertiary hover:text-text-primary ml-2 text-xs underline">
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <label className="label">WhatsApp number (optional)</label>
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+60123456789"
          className="input flex-1"
        />
        <Button variant="primary" onClick={handleSave} loading={isPending} className="h-10">
          Save
        </Button>
      </div>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
      <p className="text-xs text-text-tertiary mt-1">Include country code. We&apos;ll send WhatsApp updates to this number.</p>
    </div>
  )
}
