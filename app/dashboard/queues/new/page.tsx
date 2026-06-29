'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createQueue } from '@/app/actions/queues'
import { Button } from '@/components/ui/Button'

export default function NewQueuePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<'auto' | 'invoice'>('auto')
  const [avgService, setAvgService] = useState('5')
  const [maxTickets, setMaxTickets] = useState('')
  const [slug, setSlug] = useState('')

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleNameChange(val: string) {
    setName(val)
    if (!slug || slug === autoSlug(name)) setSlug(autoSlug(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createQueue({
        name,
        ...(description ? { description } : {}),
        mode,
        avg_service_minutes: parseInt(avgService, 10) || 5,
        ...(maxTickets ? { max_tickets: parseInt(maxTickets, 10) } : {}),
        slug,
      })
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(`/dashboard/queues/${result.id}`)
      }
    })
  }

  return (
    <div className="max-w-lg">
      <h1 className="page-header">New Queue</h1>
      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        <div>
          <label className="label">Queue Name *</label>
          <input className="input" value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Cashier Queue A" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional — visible to customers" />
        </div>
        <div>
          <label className="label">URL Slug *</label>
          <div className="flex items-center gap-0">
            <span className="input rounded-r-none bg-bg-base text-text-tertiary w-auto px-3 border-r-0 flex-shrink-0">/q/</span>
            <input
              className="input rounded-l-none flex-1"
              value={slug}
              onChange={e => setSlug(autoSlug(e.target.value))}
              placeholder="cashier-a"
              required
            />
          </div>
          <p className="text-xs text-text-tertiary mt-1">Customers use this URL to join: <span className="mono">/q/{slug || 'your-slug'}</span></p>
        </div>
        <div>
          <label className="label">Ticket Mode *</label>
          <div className="flex gap-3">
            {(['auto', 'invoice'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 border rounded-lg py-3 px-4 text-sm transition-colors ${mode === m ? 'border-primary bg-primary/5 text-primary' : 'border-bg-border text-text-secondary'}`}
              >
                <div className="font-medium">{m === 'auto' ? 'Auto Number' : 'Invoice Number'}</div>
                <div className="text-xs mt-0.5 opacity-70">{m === 'auto' ? 'Auto-assign A001, A002…' : 'Customer enters invoice #'}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Avg. Service Time (minutes)</label>
          <input type="number" min={1} className="input w-28" value={avgService} onChange={e => setAvgService(e.target.value)} />
        </div>
        <div>
          <label className="label">Max Tickets (optional)</label>
          <input type="number" min={1} className="input w-28" value={maxTickets} onChange={e => setMaxTickets(e.target.value)} placeholder="∞" />
          <p className="text-xs text-text-tertiary mt-1">Leave blank for unlimited</p>
        </div>
        {error && <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}
        <Button type="submit" loading={isPending} className="w-full">
          Create Queue
        </Button>
      </form>
    </div>
  )
}
