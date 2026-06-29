'use client'

import { useRef } from 'react'

export function QRCodeCard({ slug, queueName }: { slug: string; queueName: string }) {
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/q/${slug}`
    : `/q/${slug}`

  function copyLink() {
    void navigator.clipboard.writeText(url)
  }

  return (
    <div className="card p-5">
      <p className="section-title mb-3">Customer Join Link</p>
      <div className="bg-bg-base rounded-lg p-3 flex items-center gap-2 mb-3">
        <code className="text-xs text-text-secondary flex-1 break-all">{url}</code>
        <button
          onClick={copyLink}
          className="text-primary hover:text-primary-hover transition-colors flex-shrink-0"
          title="Copy link"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="5" width="9" height="9" rx="1" />
            <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-text-tertiary">Share this link or QR code so customers can join <strong>{queueName}</strong>.</p>
    </div>
  )
}
