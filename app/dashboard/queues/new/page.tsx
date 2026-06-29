'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createQueue } from '@/app/actions/queues'
import { Topbar } from '@/components/layout/Topbar'
import { Input, Textarea, Select } from '@/components/ui/Input'
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
    <>
      <Topbar title="New Queue" subtitle="Set up a digital queue for your customers" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="card p-6 space-y-4">
              <h2 className="section-header">Queue Details</h2>

              <Input
                id="name"
                label="Queue Name"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Cashier Queue A"
                required
              />

              <Textarea
                id="description"
                label="Description"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional — visible to customers joining this queue"
              />

              <div className="space-y-1">
                <label htmlFor="slug" className="label">URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-bg-border bg-bg-base text-text-tertiary text-sm select-none">
                    /q/
                  </span>
                  <input
                    id="slug"
                    className="input rounded-l-none flex-1"
                    value={slug}
                    onChange={e => setSlug(autoSlug(e.target.value))}
                    placeholder="cashier-a"
                    required
                  />
                </div>
                <p className="text-text-tertiary text-xs">
                  Customers join at: <span className="font-mono">omniqueue.app/q/{slug || 'your-slug'}</span>
                </p>
              </div>
            </div>

            <div className="card p-6 space-y-4 mt-4">
              <h2 className="section-header">Configuration</h2>

              <div className="space-y-1">
                <label className="label">Ticket Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['auto', 'invoice'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`border rounded-lg py-3 px-4 text-left transition-colors ${
                        mode === m
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-bg-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      <div className="text-sm font-medium">{m === 'auto' ? 'Auto Number' : 'Invoice Number'}</div>
                      <div className="text-xs mt-0.5 opacity-70">
                        {m === 'auto' ? 'System assigns A001, A002…' : 'Customer enters their own reference'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                id="avgService"
                label="Average Service Time (minutes)"
                type="number"
                min={1}
                value={avgService}
                onChange={e => setAvgService(e.target.value)}
                className="w-28"
              />

              <Input
                id="maxTickets"
                label="Max Tickets per Session"
                type="number"
                min={1}
                value={maxTickets}
                onChange={e => setMaxTickets(e.target.value)}
                placeholder="Unlimited"
                className="w-28"
                hint="Leave blank for unlimited"
              />
            </div>

            {error && (
              <div className="mt-4 bg-danger/10 border border-danger/30 rounded-lg p-3 text-danger text-sm">
                {error}
              </div>
            )}

            <div className="mt-4">
              <Button type="submit" loading={isPending} className="w-full">
                Create Queue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
