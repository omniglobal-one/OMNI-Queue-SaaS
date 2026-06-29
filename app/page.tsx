import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLATFORM } from '@/lib/platform-info'

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* Navbar — centered logo only, matching all OMNI projects */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
          </div>
          <span className="text-lg font-bold text-text-primary">{PLATFORM.name}</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-16 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-bg-border shadow-sm text-text-secondary px-4 py-1.5 rounded-full text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Real-time queues • Push notifications • WhatsApp alerts
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.05] tracking-tight mb-10">
            No more waiting
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">in line.</span>
              <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8.5C60 3 120 2 150 2C180 2 240 3 298 8.5" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" opacity="0.3"/>
              </svg>
            </span>
          </h1>

          <p className="text-xl text-text-secondary leading-relaxed mb-10 max-w-xl mx-auto">
            {PLATFORM.name} lets your customers join queues digitally, track their position in real time, and get notified the moment it&apos;s their turn — no app required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/25"
            >
              Get started free
            </Link>
          </div>
        </div>

        {/* Mock queue preview */}
        <div className="relative mt-20 max-w-4xl w-full mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-10 pointer-events-none" style={{ top: '60%' }} />
          <div className="bg-white border border-bg-border rounded-2xl shadow-2xl shadow-gray-200 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-bg-border bg-bg-base">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
              <div className="flex-1 mx-4 bg-bg-border rounded-md h-5 flex items-center px-3">
                <span className="text-text-tertiary text-xs font-mono">omniqueue.app/q/cafe-aroma-orders</span>
              </div>
            </div>
            <div className="p-4 bg-gray-950 space-y-2">
              {[
                { num: 'A005', name: 'Rosmah Binti Ali', status: 'Being Served', active: true },
                { num: 'A006', name: 'James Ooi', status: 'Position 1', active: false },
                { num: 'A007', name: 'Kavitha Krishnan', status: 'Position 2', active: false },
                { num: 'A008', name: 'Waiting…', status: 'Position 3', active: false },
              ].map((t) => (
                <div key={t.num} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${t.active ? 'bg-primary/20 border border-primary/30' : 'bg-white/5'}`}>
                  <span className={`font-mono text-sm font-bold ${t.active ? 'text-primary' : 'text-white/50'}`}>#{t.num}</span>
                  <span className="flex-1 text-sm text-white/70">{t.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${t.active ? 'bg-primary/30 text-primary' : 'bg-white/10 text-white/40'}`}>{t.status}</span>
                </div>
              ))}
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-white/40 text-xs font-medium">Café Aroma — Order Queue</span>
                <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  7 waiting
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-text-primary">Three steps, zero waiting rooms</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-7 left-1/3 right-1/3 h-px bg-bg-border" />
          {[
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />,
              title: 'Scan or tap a link',
              body: 'Customers join your queue by scanning a QR code or tapping a link — no app download, no account needed.',
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
              title: 'Track in real time',
              body: 'Their live position updates automatically. They see exactly how many people are ahead and an estimated wait time.',
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
              title: 'Get called instantly',
              body: 'When their turn arrives, they receive a push notification or WhatsApp message — even if the tab is closed.',
            },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">{s.icon}</svg>
                </div>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-bg-border rounded-full text-[10px] font-bold text-text-tertiary flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white px-6">
        <div className="max-w-5xl mx-auto bg-gray-950 text-white rounded-3xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                accent: 'text-blue-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />,
                title: 'QR code join',
                body: 'Print a QR code or share a link. Customers join in seconds from any device.',
              },
              {
                accent: 'text-amber-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: 'Instant call next',
                body: 'One-tap to advance the queue. Notifications fire automatically to the next customer.',
              },
              {
                accent: 'text-green-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                title: 'Live analytics',
                body: 'See tickets served, skipped, and average wait times updated in real time.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-gray-950 px-8 py-10 flex flex-col items-center text-center">
                <svg className={`w-6 h-6 ${f.accent} mb-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-4">Ready to go digital?</h2>
          <p className="text-text-secondary mb-8">Create your first queue in under 2 minutes. No setup fees.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            Get started free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-bg-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="w-4 h-4 rounded" />
            </div>
            <span className="text-sm font-semibold text-text-secondary">{PLATFORM.name}</span>
          </div>
          <p className="text-text-tertiary text-sm">© {new Date().getFullYear()} {PLATFORM.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
