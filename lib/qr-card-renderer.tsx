import { ImageResponse } from 'next/og'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

const W = 1240
const H = 1754
const ACCENT = '#2563eb'
const r = 37; const g = 99; const b = 235
const accentAlpha = (a: number) => `rgba(${r},${g},${b},${a})`

let cachedIcon: string | null = null
function getIcon(): string {
  if (cachedIcon !== null) return cachedIcon
  try {
    cachedIcon = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), 'public', 'icon.png')).toString('base64')}`
  } catch {
    cachedIcon = ''
  }
  return cachedIcon
}

async function makeQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 600,
    margin: 1,
    color: { dark: '#111827', light: '#ffffff' },
  })
}

const STEPS = [
  'Open your camera and scan this QR code',
  'Enter your name and phone number',
  'You\'ll receive your queue ticket instantly',
]

export interface QueueCardParams {
  queueName: string
  queueSlug: string
  appUrl: string
}

export async function renderQueueCardPng(params: QueueCardParams): Promise<Buffer> {
  const { queueName, queueSlug, appUrl } = params
  const joinUrl = `${appUrl}/q/${queueSlug}`
  const icon = getIcon()
  const qrDataUrl = await makeQrDataUrl(joinUrl)

  const response = new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, backgroundColor: '#ffffff' }}>
        <div style={{ height: 16, width: '100%', backgroundColor: ACCENT }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 96px', flexGrow: 1, gap: 48 }}>
          {/* Platform header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {icon && <img src={icon} width={72} height={72} style={{ borderRadius: 16 }} />}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>OMNI Queue</div>
              <div style={{ fontSize: 17, color: '#9ca3af' }}>Digital Queue System</div>
            </div>
          </div>

          {/* Queue name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.1 }}>
              {queueName}
            </div>
            <div style={{ fontSize: 24, color: '#6b7280', textAlign: 'center' }}>
              Scan below to join the queue
            </div>
          </div>

          {/* QR code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 32px 20px', borderRadius: 32, border: `3px solid ${accentAlpha(0.2)}`, backgroundColor: accentAlpha(0.03) }}>
            <img src={qrDataUrl} width={560} height={560} />
            <div style={{ marginTop: 16, fontSize: 18, color: '#9ca3af', textAlign: 'center' }}>{joinUrl}</div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, backgroundColor: i === 0 ? accentAlpha(0.06) : '#f9fafb', borderRadius: 18, padding: '20px 24px' }}>
                <div style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: accentAlpha(0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px 96px', borderTop: '1px solid #f3f4f6' }}>
          {icon && <img src={icon} width={22} height={22} style={{ borderRadius: 5 }} />}
          <div style={{ fontSize: 17, color: '#9ca3af' }}>Powered by OMNI Queue</div>
        </div>

        <div style={{ height: 16, width: '100%', backgroundColor: ACCENT }} />
      </div>
    ),
    { width: W, height: H }
  )

  return Buffer.from(await response.arrayBuffer())
}
