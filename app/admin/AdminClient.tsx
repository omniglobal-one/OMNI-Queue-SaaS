'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Download } from 'lucide-react'
import { QueueStatusBadge } from '@/components/dashboard/StatusBadges'
import { StatCard } from '@/components/dashboard/StatCard'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectNative } from '@/components/ui/select-native'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Merchants" value={`${stats.activeMerchants} / ${stats.totalMerchants}`} sub="active / total" />
        <StatCard label="Open Queues" value={stats.openQueues} sub={`${stats.totalQueues} total`} />
        <StatCard label="Waiting Now" value={stats.totalPending} sub="across all queues" />
        <StatCard label="Total Served" value={stats.totalServed} sub="all time" />
      </div>

      {/* Merchants */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="text-base">Merchants</CardTitle>
          <p className="text-xs text-muted-foreground">{profiles.length} accounts</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Queues</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.business_name ?? <span className="italic text-muted-foreground">No name</span>}</p>
                    {p.business_slug && <p className="font-mono text-xs text-muted-foreground">/{p.business_slug}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground">{emailMap[p.id] ?? '—'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>{p.role}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold">{merchantQueueCount[p.id] ?? 0}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {p.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => setCreateModal({ merchantId: p.id, merchantName: p.business_name ?? 'this merchant' })}
                            disabled={isPending}
                            className="rounded px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                          >
                            + Queue
                          </button>
                          <button
                            onClick={() => handleToggle(p.id, p.is_active)}
                            disabled={isPending}
                            className="rounded px-2.5 py-1 text-xs font-medium text-warning transition-colors hover:bg-warning/10 disabled:opacity-50 data-[active=false]:text-success data-[active=false]:hover:bg-success/10"
                            data-active={p.is_active}
                          >
                            {p.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: 'merchant', id: p.id, name: p.business_name ?? 'this merchant' })}
                            disabled={isPending}
                            className="rounded px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Queues */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="text-base">All Queues</CardTitle>
          <p className="text-xs text-muted-foreground">{queues.length} queues across all merchants</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-center">Mode</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Waiting</TableHead>
                <TableHead className="text-center">Served</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map(q => {
                const counts = ticketCountMap[q.id]
                const merchant = profiles.find(p => p.id === q.merchant_id)
                return (
                  <TableRow key={q.id}>
                    <TableCell>
                      <p className="font-medium">{q.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">/q/{q.slug}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">{merchant?.business_name ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-xs text-muted-foreground">{q.mode}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <QueueStatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={(counts?.pending ?? 0) > 0 ? 'text-sm font-bold text-primary' : 'text-sm font-bold text-muted-foreground'}>
                        {counts?.pending ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-success">{counts?.completed ?? 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/qr-card?id=${q.id}`}
                          download={`${q.slug}-queue-card.png`}
                          className="flex items-center gap-1 rounded bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                          title="Download QR card"
                        >
                          <Download className="size-3" /> QR
                        </a>
                        <button
                          onClick={() => setDeleteModal({ type: 'queue', id: q.id, name: q.name })}
                          disabled={isPending}
                          className="rounded bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Dialog open={!!deleteModal} onOpenChange={(open) => !open && setDeleteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleteModal?.type === 'merchant' ? 'Merchant' : 'Queue'}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to remove <strong>{deleteModal?.name}</strong>?
            {deleteModal?.type === 'merchant' ? ' This will delete their account and all associated queues and tickets.' : ' This will delete all tickets in this queue.'}
            {' '}This cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="size-4 animate-spin" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create queue modal */}
      <Dialog open={!!createModal} onOpenChange={(open) => { if (!open) { setCreateModal(null); setCreateError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Queue for {createModal?.merchantName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Queue Name</Label>
              <Input value={createForm.name} onChange={e => handleCreateNameChange(e.target.value)} placeholder="e.g. Main Counter" />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <div className="flex">
                <span className="inline-flex select-none items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">/q/</span>
                <Input
                  className="rounded-l-none"
                  value={createForm.slug}
                  onChange={e => setCreateForm(f => ({ ...f, slug: autoSlug(e.target.value) }))}
                  placeholder="main-counter"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="createMode">Ticket Mode</Label>
              <SelectNative
                id="createMode"
                value={createForm.mode}
                onChange={e => setCreateForm(f => ({ ...f, mode: e.target.value as 'auto' | 'invoice' }))}
              >
                <option value="auto">Auto Number</option>
                <option value="invoice">Invoice Number</option>
              </SelectNative>
            </div>
            <div className="space-y-2">
              <Label>Avg Service Time (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={createForm.avg_service_minutes}
                onChange={e => setCreateForm(f => ({ ...f, avg_service_minutes: e.target.value }))}
                className="w-24"
              />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setCreateModal(null); setCreateError(null) }} className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} disabled={isPending || !createForm.name || !createForm.slug} className="flex-1">
                {isPending && <Loader2 className="size-4 animate-spin" />} Create Queue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
