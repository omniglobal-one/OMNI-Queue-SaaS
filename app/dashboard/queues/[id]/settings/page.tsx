'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { updateQueueSettings, deleteQueue } from '@/app/actions/queues'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { Queue } from '@/types'

export default function QueueSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [queue, setQueue] = useState<Queue | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const [avgService, setAvgService] = useState('5')
  const [maxTickets, setMaxTickets] = useState('')
  const [isAccepting, setIsAccepting] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('queues').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        const q = data as Queue
        setQueue(q)
        setAvgService(String(q.avg_service_minutes))
        setMaxTickets(q.max_tickets ? String(q.max_tickets) : '')
        setIsAccepting(q.is_accepting)
      }
    })
  }, [id])

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateQueueSettings({
        queue_id: id,
        avg_service_minutes: parseInt(avgService, 10),
        is_accepting: isAccepting,
        max_tickets: maxTickets ? parseInt(maxTickets, 10) : null,
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
          <div className="skeleton h-64 rounded-lg max-w-2xl" />
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
            <Button loading={isPending} onClick={handleSave}>Save Changes</Button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl space-y-6">

          <div className="card p-6 space-y-4">
            <h2 className="section-header">Queue Info</h2>
            <div className="space-y-3 divide-y divide-bg-border">
              <div className="flex items-center justify-between py-2 first:pt-0">
                <span className="text-text-secondary text-sm">Name</span>
                <span className="text-text-primary text-sm font-medium">{queue.name}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Mode</span>
                <Badge variant="neutral">{queue.mode === 'auto' ? 'Auto Number' : 'Invoice Number'}</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Join URL</span>
                <span className="text-text-tertiary text-xs font-mono">/q/{queue.slug}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary text-sm">Status</span>
                <Badge variant={queue.status === 'open' ? 'success' : queue.status === 'paused' ? 'warning' : 'neutral'}>
                  {queue.status.charAt(0).toUpperCase() + queue.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="section-header">Settings</h2>

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

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="accepting"
                checked={isAccepting}
                onChange={e => setIsAccepting(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="accepting" className="text-sm text-text-secondary select-none">
                Accepting new tickets
              </label>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-danger text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-danger mb-1">Danger Zone</h2>
            <p className="text-text-tertiary text-sm mb-4">
              Deleting this queue permanently removes all tickets and history.
            </p>
            <Button variant="danger" onClick={() => setDeleteModal(true)}>Delete Queue</Button>
          </div>

        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Queue">
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete <strong>{queue.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={isPending} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </>
  )
}
