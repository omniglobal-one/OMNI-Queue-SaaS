'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { updateCustomerPhone } from '@/app/actions/tickets'

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-success shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.122 1.528 5.855L.057 23.882a.5.5 0 0 0 .617.617l6.086-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.536-5.375-1.469l-.385-.228-3.985.962.979-3.908-.249-.401A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
)

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
      <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 flex items-center gap-3">
        <WhatsAppIcon />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-tertiary leading-none mb-2">WhatsApp updates sent to</p>
          <p className="text-sm font-semibold text-text-primary font-mono">{phone}</p>
        </div>
        <button
          onClick={() => setSaved(false)}
          className="shrink-0 flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-bg-border"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" />
          </svg>
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
