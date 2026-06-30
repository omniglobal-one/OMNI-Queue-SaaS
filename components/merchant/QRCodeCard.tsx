'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

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
    <div className="card p-6">
      <p className="section-title mb-4">Customer Join Link</p>

      <div className="flex justify-center mb-4">
        {qrDataUrl ? (
          <div className="rounded-xl border border-bg-border bg-white p-3 inline-block">
            <img
              src={qrDataUrl}
              alt={`QR code for ${queueName}`}
              width={160}
              height={160}
              className="block"
            />
          </div>
        ) : (
          <div className="w-[184px] h-[184px] rounded-xl border border-bg-border bg-bg-base flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
        )}
      </div>

      <div className="bg-bg-base rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
        <code className="text-xs text-text-secondary flex-1 break-all">{url}</code>
        <button
          onClick={copyLink}
          className="text-primary hover:text-primary-hover transition-colors flex-shrink-0"
          title="Copy link"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      <a
        href={`/api/qr-card?id=${queueId}`}
        download={`${slug}-queue-card.png`}
        className="btn btn-ghost w-full flex items-center justify-center gap-2 text-sm"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Print Card
      </a>
    </div>
  )
}
