import Link from 'next/link'
import { PLATFORM } from '@/lib/platform-info'

const features = [
  { icon: '🎟️', title: 'Digital Tickets', body: 'Customers join your queue via a simple link or QR code — no app download needed.' },
  { icon: '📡', title: 'Live Position Tracking', body: 'Real-time position updates so customers always know exactly where they stand.' },
  { icon: '🔔', title: 'Push Notifications', body: 'Alert customers the moment their turn arrives — even when the tab is closed.' },
  { icon: '💬', title: 'WhatsApp Alerts', body: 'One-click WhatsApp messages for next-up, ready, and no-show notifications.' },
  { icon: '⚡', title: 'Instant Call Next', body: 'Merchant dashboard with one-tap ticket advancement and live queue feed.' },
  { icon: '📊', title: 'Today\'s Stats', body: 'Track tickets served, skipped, and average wait times at a glance.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm">{PLATFORM.name}</span>
        </div>
        <Link href="/login" className="btn-primary text-sm h-9 px-4">
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Digital Queue Management
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-10">
          No more waiting{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">in line</span>
            <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8.5C60 3 120 2 150 2C180 2 240 3 298 8.5" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" opacity="0.3"/>
            </svg>
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
          {PLATFORM.name} lets your customers join queues digitally, track their position in real time, and get notified the moment it&apos;s their turn — all without an app.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary text-base h-12 px-8">
            Get started free
          </Link>
          <a href="#features" className="btn-ghost text-base h-12 px-8 bg-white/10 text-white hover:bg-white/20">
            See how it works
          </a>
        </div>
      </section>

      {/* Mock preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Waiting', value: '12', highlight: true },
              { label: 'Served Today', value: '47' },
              { label: 'Skipped', value: '2' },
              { label: 'Est. Wait', value: '36m' },
            ].map(s => (
              <div key={s.label} className={`rounded-lg p-4 ${s.highlight ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-white/10'}`}>
                <p className="text-xs text-white/50 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.highlight ? 'text-primary' : 'text-white'}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/5 rounded-lg divide-y divide-white/10">
            {[
              { num: 'A001', name: 'Ahmad Razif', status: 'Being Served', pos: '→' },
              { num: 'A002', name: 'Lim Wei Kang', status: 'Waiting', pos: '2' },
              { num: 'A003', name: 'Priya Nair', status: 'Waiting', pos: '3' },
            ].map(t => (
              <div key={t.num} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="text-white/40 w-4 text-center">{t.pos}</span>
                <span className="font-mono text-white/80">#{t.num}</span>
                <span className="flex-1 text-white/60">{t.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'Being Served' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Everything you need
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
            Built for businesses that care about their customers&apos; time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-950 px-8 py-10 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to go digital?</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">Create your first queue in under 2 minutes. No setup fees.</p>
        <Link href="/login" className="btn-primary text-base h-12 px-10">
          Start for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-white/30 text-sm">
        © {new Date().getFullYear()} {PLATFORM.name}. All rights reserved.
      </footer>
    </div>
  )
}
