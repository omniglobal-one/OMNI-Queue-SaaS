'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Loader2, X } from 'lucide-react'
import { updateQueueSettings, deleteQueue, getOwnQueue } from '@/app/actions/queues'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Queue } from '@/types'

export default function QueueSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [queue, setQueue] = useState<Queue | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const [name, setName] = useState('')
  const [avgService, setAvgService] = useState('5')
  const [maxTickets, setMaxTickets] = useState('')
  const [isAccepting, setIsAccepting] = useState(true)
  const [passcode, setPasscode] = useState('')

  useEffect(() => {
    getOwnQueue(id).then(result => {
      if ('error' in result) {
        setNotFound(true)
        return
      }
      const q = result.queue
      setQueue(q)
      setName(q.name)
      setAvgService(String(q.avg_service_minutes))
      setMaxTickets(q.max_tickets ? String(q.max_tickets) : '')
      setIsAccepting(q.is_accepting)
      setPasscode(q.passcode ?? '')
    })
  }, [id])

  if (notFound) {
    return (
      <>
        <Topbar title="Queue Settings" />
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="mx-auto max-w-3xl">
            <CardContent className="p-6 text-center text-muted-foreground">
              This queue doesn&apos;t exist or you don&apos;t have access to it.
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateQueueSettings({
        queue_id: id,
        name,
        avg_service_minutes: parseInt(avgService, 10),
        is_accepting: isAccepting,
        max_tickets: maxTickets ? parseInt(maxTickets, 10) : null,
        passcode: passcode.length === 4 ? passcode : null,
      })
      if (result.error) setError(result.error)
      else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteQueue({ queue_id: id })
      router.push('/dashboard/queues')
    })
  }

  if (!queue) {
    return (
      <>
        <Topbar title="Queue Settings" />
        <div className="p-4 sm:p-6 lg:p-8">
          <Skeleton className="mx-auto h-64 max-w-3xl rounded-lg" />
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar
        title={`${queue.name} — Settings`}
        subtitle="Manage queue configuration"
        actions={
          <div className="flex items-center gap-3">
            {saved && <Badge variant="success">Saved</Badge>}
            <Button disabled={isPending} onClick={handleSave}>
              {isPending && <Loader2 className="size-4 animate-spin" />} Save Changes
            </Button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Queue Info</h2>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between gap-4 py-2 first:pt-0">
                  <span className="shrink-0 text-sm text-muted-foreground">Name</span>
                  <Input
                    className="max-w-[200px] text-right"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Queue name"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <Badge variant="secondary">{queue.mode === 'auto' ? 'Auto Number' : 'Invoice Number'}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Join URL</span>
                  <span className="font-mono text-xs text-muted-foreground">/q/{queue.slug}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={queue.status === 'open' ? 'success' : queue.status === 'paused' ? 'warning' : 'secondary'}>
                    {queue.status.charAt(0).toUpperCase() + queue.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Settings</h2>

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

              <div className="flex items-center gap-3 pt-1">
                <Checkbox
                  id="accepting"
                  checked={isAccepting}
                  onCheckedChange={(v) => setIsAccepting(v === true)}
                />
                <Label htmlFor="accepting" className="font-normal text-muted-foreground">
                  Accepting new tickets
                </Label>
              </div>

              <div className="space-y-1.5 border-t border-border pt-3">
                <Label>Queue Passcode</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={passcode}
                    onChange={e => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 1234"
                    className="w-28 text-center font-mono text-lg tracking-widest"
                  />
                  {passcode && (
                    <button
                      type="button"
                      onClick={() => setPasscode('')}
                      className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {passcode.length === 4
                    ? 'Customers must enter this code before joining the queue.'
                    : 'Enter a 4-digit code to require customers to verify before joining. Leave blank to disable.'}
                </p>
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-1 font-semibold text-destructive">Danger Zone</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Deleting this queue permanently removes all tickets and history.
              </p>
              <Button variant="destructive" onClick={() => setDeleteModal(true)}>Delete Queue</Button>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Queue</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete <strong>{queue.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="flex-1">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
