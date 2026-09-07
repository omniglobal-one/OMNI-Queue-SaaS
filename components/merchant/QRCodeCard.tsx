'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode, Check, Copy, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function QRCodeCard({
  queueId,
  slug,
  queueName,
}: {
  queueId: string
  slug: string
  queueName: string
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://queue.omnidesk.one'
  const url = `${baseUrl}/q/${slug}`

  useEffect(() => {
    void QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      color: { dark: '#111827', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [url])

  function copyLink() {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer Join Link</p>

        <div className="mb-4 flex justify-center">
          {qrDataUrl ? (
            <div className="inline-block rounded-xl border border-border bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={`QR code for ${queueName}`} width={160} height={160} className="block" />
            </div>
          ) : (
            <div className="flex h-[184px] w-[184px] items-center justify-center rounded-xl border border-border bg-muted">
              <QrCode className="size-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <code className="flex-1 break-all text-xs text-muted-foreground">{url}</code>
          <button onClick={copyLink} className="shrink-0 text-primary transition-colors hover:text-primary/80" title="Copy link">
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          </button>
        </div>

        <Button asChild variant="outline" className="w-full">
          <a href={`/api/qr-card?id=${queueId}`} download={`${slug}-queue-card.png`}>
            <Download className="size-[15px]" /> Download Print Card
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
