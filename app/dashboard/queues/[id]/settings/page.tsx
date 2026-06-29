'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { updateQueueSettings, deleteQueue } from '@/app/actions/queues'
import { Topbar } from '@/components/layout/Topbar'
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
      else setSaved(true)
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
        <div className="p-4 sm:p-6 lg:p-8 text-text-tertiary">Loading…</div>
      </>
    )
  }

  return (
    <>
      <Topbar title={`Settings — ${queue.name}`} subtitle="Manage queue configuration" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg space-y-6">
          <div className="card p-6 flex flex-col gap-5">
            <div>
              <label className="label">Avg. Service Time (minutes)</label>
              <input type="number" min={1} className="input w-28" value={avgService} onChange={e => setAvgService(e.target.value)} />
            </div>
            <div>
              <label className="label">Max Tickets</label>
              <input type="number" min={1} className="input w-28" value={maxTickets} onChange={e => setMaxTickets(e.target.value)} placeholder="∞" />
              <p className="text-xs text-text-tertiary mt-1">Leave blank for unlimited</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="accepting"
                checked={isAccepting}
                onChange={e => setIsAccepting(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="accepting" className="text-sm text-text-secondary">Accepting new tickets</label>
            </div>
            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-danger text-sm">{error}</div>
            )}
            {saved && <p className="text-success text-sm">Settings saved.</p>}
            <Button onClick={handleSave} loading={isPending}>Save Settings</Button>
          </div>

          <div className="card p-6 border-danger/20">
            <h2 className="font-semibold text-danger mb-2">Danger Zone</h2>
            <p className="text-text-tertiary text-sm mb-4">Deleting this queue will permanently remove all tickets and events.</p>
            <Button variant="danger" onClick={() => setDeleteModal(true)}>Delete Queue</Button>
          </div>
        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Queue">
        <p className="text-text-secondary mb-6">Are you sure you want to delete <strong>{queue.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={isPending} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </>
  )
}
