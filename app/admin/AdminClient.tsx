'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { QueueStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toggleMerchantActive, deleteMerchant, adminDeleteQueue, adminCreateQueue } from '@/app/actions/admin'
import type { Profile, Queue } from '@/types'

interface TicketCounts {
  queue_id: string
  pending: number
  completed: number
  total: number
}

interface AdminClientProps {
  profiles: Profile[]
  queues: Queue[]
  ticketCountMap: Record<string, TicketCounts>
  merchantQueueCount: Record<string, number>
  emailMap: Record<string, string>
  stats: {
    activeMerchants: number
    totalMerchants: number
    openQueues: number
    totalPending: number
    totalServed: number
    totalQueues: number
  }
}

function autoSlug(val: string) {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function AdminClient({ profiles, queues, ticketCountMap, merchantQueueCount, emailMap, stats }: AdminClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [deleteModal, setDeleteModal] = useState<{ type: 'merchant' | 'queue'; id: string; name: string } | null>(null)
  const [createModal, setCreateModal] = useState<{ merchantId: string; merchantName: string } | null>(null)
  const [createForm, setCreateForm] = useState({ name: '', slug: '', mode: 'auto' as 'auto' | 'invoice', avg_service_minutes: '5' })
  const [createError, setCreateError] = useState<string | null>(null)

  function handleToggle(merchantId: string, currentActive: boolean) {
    startTransition(async () => {
      await toggleMerchantActive({ merchant_id: merchantId, is_active: !currentActive })
      router.refresh()
    })
  }

  function handleDelete() {
    if (!deleteModal) return
    startTransition(async () => {
      if (deleteModal.type === 'merchant') {
        await deleteMerchant({ merchant_id: deleteModal.id })
      } else {
        await adminDeleteQueue({ queue_id: deleteModal.id })
      }
      setDeleteModal(null)
      router.refresh()
    })
  }

  function handleCreateNameChange(val: string) {
    setCreateForm(f => ({
      ...f,
      name: val,
      slug: f.slug === autoSlug(f.name) || !f.slug ? autoSlug(val) : f.slug,
    }))
  }

  function handleCreate() {
    if (!createModal) return
    setCreateError(null)
    startTransition(async () => {
      const result = await adminCreateQueue({
        merchant_id: createModal.merchantId,
        name: createForm.name,
        mode: createForm.mode,
        slug: createForm.slug,
        avg_service_minutes: parseInt(createForm.avg_service_minutes, 10) || 5,
      })
      if ('error' in result) {
        setCreateError(result.error)
      } else {
        setCreateModal(null)
        setCreateForm({ name: '', slug: '', mode: 'auto', avg_service_minutes: '5' })
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Merchants', value: `${stats.activeMerchants} / ${stats.totalMerchants}`, sub: 'active / total' },
          { label: 'Open Queues', value: stats.openQueues, sub: `${stats.totalQueues} total` },
          { label: 'Waiting Now', value: stats.totalPending, sub: 'across all queues' },
          { label: 'Total Served', value: stats.totalServed, sub: 'all time' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-text-tertiary">{s.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{s.value}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Merchants */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Merchants</h2>
            <p className="text-xs text-text-tertiary mt-0.5">{profiles.length} accounts</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border bg-bg-base">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Business</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Email</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Role</th>
                <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Queues</th>
                <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Status</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-text-tertiary">Joined</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-text-tertiary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border/60">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-bg-base/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-text-primary">{p.business_name ?? <span className="text-text-tertiary italic">No name</span>}</p>
                    {p.business_slug && <p className="text-xs text-text-tertiary font-mono">/{p.business_slug}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-text-secondary text-xs font-mono">{emailMap[p.id] ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-bg-border text-text-secondary'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-sm font-semibold text-text-primary">{merchantQueueCount[p.id] ?? 0}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? 'bg-success/10 text-success' : 'bg-bg-border text-text-tertiary'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-xs text-text-tertiary">
                      {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => setCreateModal({ merchantId: p.id, merchantName: p.business_name ?? 'this merchant' })}
                            disabled={isPending}
                            className="px-2.5 py-1 rounded text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            + Queue
                          </button>
                          <button
                            onClick={() => handleToggle(p.id, p.is_active)}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${p.is_active ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200' : 'text-success bg-success/10 hover:bg-success/20'}`}
                          >
                            {p.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: 'merchant', id: p.id, name: p.business_name ?? 'this merchant' })}
                            disabled={isPending}
                            className="px-2.5 py-1 rounded text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queues */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border">
          <h2 className="text-base font-semibold text-text-primary">All Queues</h2>
          <p className="text-xs text-text-tertiary mt-0.5">{queues.length} queues across all merchants</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border bg-bg-base">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Queue</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary">Merchant</th>
                <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Mode</th>
                <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Status</th>
                <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Waiting</th>
                <th className="text-center px-5 py-2.5 text-xs font-medium text-text-tertiary">Served</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-text-tertiary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border/60">
              {queues.map(q => {
                const counts = ticketCountMap[q.id]
                const merchant = profiles.find(p => p.id === q.merchant_id)
                return (
                  <tr key={q.id} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-text-primary">{q.name}</p>
                      <p className="text-xs text-text-tertiary font-mono">/q/{q.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-text-secondary">{merchant?.business_name ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs font-mono text-text-tertiary">{q.mode}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <QueueStatusBadge status={q.status} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-sm font-bold ${(counts?.pending ?? 0) > 0 ? 'text-primary' : 'text-text-tertiary'}`}>
                        {counts?.pending ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-success font-medium">{counts?.completed ?? 0}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/qr-card?id=${q.id}`}
                          download={`${q.slug}-queue-card.png`}
                          className="px-2.5 py-1 rounded text-xs font-medium text-text-secondary bg-bg-border hover:bg-bg-border/80 transition-colors"
                          title="Download QR card"
                        >
                          QR
                        </a>
                        <button
                          onClick={() => setDeleteModal({ type: 'queue', id: q.id, name: q.name })}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={`Remove ${deleteModal?.type === 'merchant' ? 'Merchant' : 'Queue'}`}>
        <p className="text-text-secondary mb-6">
          Are you sure you want to remove <strong>{deleteModal?.name}</strong>?
          {deleteModal?.type === 'merchant' ? ' This will delete their account and all associated queues and tickets.' : ' This will delete all tickets in this queue.'}
          {' '}This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={isPending} className="flex-1">Remove</Button>
        </div>
      </Modal>

      {/* Create queue modal */}
      <Modal open={!!createModal} onClose={() => { setCreateModal(null); setCreateError(null) }} title={`Create Queue for ${createModal?.merchantName}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Queue Name</label>
            <input
              className="input"
              value={createForm.name}
              onChange={e => handleCreateNameChange(e.target.value)}
              placeholder="e.g. Main Counter"
            />
          </div>
          <div>
            <label className="label">URL Slug</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-bg-border bg-bg-base text-text-tertiary text-sm select-none">/q/</span>
              <input
                className="input rounded-l-none flex-1"
                value={createForm.slug}
                onChange={e => setCreateForm(f => ({ ...f, slug: autoSlug(e.target.value) }))}
                placeholder="main-counter"
              />
            </div>
          </div>
          <div>
            <label className="label">Ticket Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(['auto', 'invoice'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCreateForm(f => ({ ...f, mode: m }))}
                  className={`border rounded-lg py-2.5 px-3 text-left transition-colors ${createForm.mode === m ? 'border-primary bg-primary/5 text-primary' : 'border-bg-border text-text-secondary hover:border-primary/40'}`}
                >
                  <div className="text-sm font-medium">{m === 'auto' ? 'Auto Number' : 'Invoice Number'}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Avg Service Time (minutes)</label>
            <input
              className="input w-24"
              type="number"
              min={1}
              value={createForm.avg_service_minutes}
              onChange={e => setCreateForm(f => ({ ...f, avg_service_minutes: e.target.value }))}
            />
          </div>
          {createError && <p className="text-danger text-sm">{createError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setCreateModal(null); setCreateError(null) }} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={isPending} disabled={!createForm.name || !createForm.slug} className="flex-1">Create Queue</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
