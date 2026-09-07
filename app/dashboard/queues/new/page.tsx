'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createQueue } from '@/app/actions/queues'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Queue Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="name">Queue Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Cashier Queue A"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optional — visible to customers joining this queue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex">
                    <span className="inline-flex select-none items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      /q/
                    </span>
                    <Input
                      id="slug"
                      className="rounded-l-none"
                      value={slug}
                      onChange={e => setSlug(autoSlug(e.target.value))}
                      placeholder="cashier-a"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customers join at: <span className="font-mono">queue.omnidesk.one/q/{slug || 'your-slug'}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Configuration</h2>

                <div className="space-y-2">
                  <Label>Ticket Mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['auto', 'invoice'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                          'rounded-lg border px-4 py-3 text-left transition-colors',
                          mode === m
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-input text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        <div className="text-sm font-medium">{m === 'auto' ? 'Auto Number' : 'Invoice Number'}</div>
                        <div className="mt-0.5 text-xs opacity-70">
                          {m === 'auto' ? 'System assigns A001, A002…' : 'Customer enters their own reference'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avgService">Average Service Time (minutes)</Label>
                  <Input
                    id="avgService"
                    type="number"
                    min={1}
                    value={avgService}
                    onChange={e => setAvgService(e.target.value)}
                    className="w-28"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTickets">Max Tickets per Session</Label>
                  <Input
                    id="maxTickets"
                    type="number"
                    min={1}
                    value={maxTickets}
                    onChange={e => setMaxTickets(e.target.value)}
                    placeholder="Unlimited"
                    className="w-28"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for unlimited</p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-4">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creating…
                  </>
                ) : (
                  'Create Queue'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
