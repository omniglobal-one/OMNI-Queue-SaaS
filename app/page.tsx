import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  QrCode,
  BellRinging,
  ChatCircleText,
  ChartLineUp,
  ClockCountdown,
  ShieldCheck,
  Kanban,
  CheckCircle,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLATFORM } from '@/lib/platform-info'

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <FeatureGrid />
        <HowItWorks />
        <Pricing />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-[15px] font-semibold tracking-tight">{PLATFORM.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#platform" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Platform
          </a>
          <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/q/cafe-aroma-orders">See a live queue</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">
              Get started <ArrowRight weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="container grid gap-14 py-16 md:grid-cols-2 md:items-center md:py-24 lg:py-28">
      <div className="max-w-xl">
        <Badge variant="outline" className="mb-6 gap-1.5 border-primary/25 bg-primary/5 py-1 text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Real-time queues · Push alerts · WhatsApp
        </Badge>
        <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          No more waiting in line.
        </h1>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
          Customers join your queue by scanning a code, track their live position from their own
          phone, and get called the moment it&apos;s their turn — no app install, no crowded
          waiting room.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="px-6">
            <Link href="/login">
              Get started free <ArrowRight weight="bold" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-6">
            <Link href="/q/cafe-aroma-orders">See a live queue</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          First month free. No credit card required.
        </p>
      </div>
      <QueuePreview />
    </section>
  )
}

function QueuePreview() {
  const rows = [
    { num: 'A005', name: 'Rosmah Binti Ali', status: 'Being served', tone: 'default' as const },
    { num: 'A006', name: 'James Ooi', status: 'Position 1', tone: 'outline' as const },
    { num: 'A007', name: 'Kavitha Krishnan', status: 'Position 2', tone: 'outline' as const },
    { num: 'A008', name: 'Waiting…', status: 'Position 3', tone: 'outline' as const },
  ]
  return (
    <div className="relative">
      <div className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-12px_rgba(0,0,0,0.14)]">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Kanban className="size-4 text-primary" weight="fill" />
            Café Aroma — Order Queue
          </div>
          <span className="text-xs text-muted-foreground">/q/cafe-aroma-orders</span>
        </div>
        <ul className="divide-y divide-border/70">
          {rows.map((r) => (
            <li key={r.num} className="flex items-center gap-3 px-4 py-3.5">
              <span className="w-12 shrink-0 font-mono text-sm font-bold text-primary">#{r.num}</span>
              <p className="min-w-0 flex-1 truncate text-sm">{r.name}</p>
              <Badge variant={r.tone} className="shrink-0 whitespace-nowrap">
                {r.status}
              </Badge>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>7 waiting</span>
          <span className="flex items-center gap-1">
            <CheckCircle weight="fill" className="size-3.5 text-success" /> Avg wait 6m
          </span>
        </div>
      </div>
    </div>
  )
}

function TrustStrip() {
  const items = [
    { icon: QrCode, label: 'Scan-to-join, no app needed' },
    { icon: BellRinging, label: 'Push alerts, tab closed or not' },
    { icon: ChatCircleText, label: 'One-tap WhatsApp updates' },
    { icon: ShieldCheck, label: 'Optional passcode-gated queues' },
  ]
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:gap-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </section>
  )
}

function FeatureGrid() {
  return (
    <section id="platform" className="container py-20 md:py-28">
      <div className="max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Everything a walk-in counter needs, nothing it doesn&apos;t.
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Print a QR code, hand out a link, or share it on your storefront — customers join from
          any phone, and your staff run the queue from one dashboard.
        </p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-6 md:grid-rows-2">
        <FeatureCard
          className="md:col-span-4 md:row-span-1"
          icon={QrCode}
          title="A join link for every counter"
          description="Each queue gets its own QR code and link — auto-numbered tickets or your own invoice references, whichever fits how you already work."
        />
        <FeatureCard
          className="md:col-span-2 md:row-span-2"
          icon={ChatCircleText}
          title="Notify without an app"
          description="Call next with one tap. Customers get a push notification even with the tab closed, and staff can fire off a one-tap WhatsApp message straight from the ticket."
        />
        <FeatureCard
          className="md:col-span-2 md:row-span-1"
          icon={ClockCountdown}
          title="A live wait estimate"
          description="Position and estimated wait update automatically as the queue moves, so nobody has to ask 'how much longer?'"
        />
        <FeatureCard
          className="md:col-span-2 md:row-span-1"
          icon={UsersThree}
          title="Merchant and admin roles"
          description="Staff run their own counter; platform admins see every merchant, queue, and ticket in one place."
        />
        <FeatureCard
          className="md:col-span-6 md:row-span-1 md:flex-row md:items-center md:gap-8"
          icon={ChartLineUp}
          title="A dashboard that answers 'how are we doing'"
          description="Waiting now, served today, and skipped — updated live, the moment you open the queue."
          wide
        />
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  className = '',
  wide = false,
}: {
  icon: PhosphorIcon
  title: string
  description: string
  className?: string
  wide?: boolean
}) {
  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 transition-colors hover:border-primary/30 ${
        wide ? 'md:flex-row' : ''
      } ${className}`}
    >
      <div className={wide ? 'md:max-w-md' : ''}>
        <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-[18px]" weight="duotone" />
        </div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Scan or tap a link',
      description: 'Customers join your queue by scanning a QR code or tapping a link — no app download, no account needed.',
    },
    {
      n: '02',
      title: 'Track in real time',
      description: 'Their live position updates automatically. They see exactly how many people are ahead and an estimated wait time.',
    },
    {
      n: '03',
      title: 'Get called instantly',
      description: "When their turn arrives, they get a push notification even if the tab is closed — and staff can send a one-tap WhatsApp message straight from the dashboard.",
    },
  ]
  return (
    <section id="workflow" className="border-t border-border/60 bg-muted/20 py-20 md:py-28">
      <div className="container">
        <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Three steps, zero waiting rooms.
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s) => (
            <div key={s.n}>
              <span className="text-sm font-medium text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const tiers = [
    {
      name: 'Free trial',
      price: 'Free',
      period: 'first month',
      features: ['Full access, all features', 'No commitment', 'Cancel before billing'],
      cta: 'Start free',
      variant: 'outline' as const,
    },
    {
      name: 'Monthly',
      price: '$10',
      period: '/month',
      features: ['All features included', 'Unlimited usage', 'Priority support'],
      cta: 'Get started',
      variant: 'default' as const,
    },
    {
      name: 'Annual',
      price: '$100',
      period: '/year',
      features: ['Everything in Monthly', '2 months free', 'Annual receipt'],
      cta: 'Get started',
      variant: 'default' as const,
      badge: 'Best value',
    },
  ]
  return (
    <section id="pricing" className="container py-20 md:py-28">
      <div className="text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
          Start free for your first month. No credit card required.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col rounded-xl border p-8 ${
              t.badge ? 'border-2 border-primary' : 'border-border/80'
            }`}
          >
            {t.badge && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                {t.badge}
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.name}</p>
            <div className="mb-2 mt-4 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
              <span className="mb-1 text-sm text-muted-foreground">{t.period}</span>
            </div>
            <ul className="mb-8 mt-4 flex-1 space-y-3 text-sm text-muted-foreground">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="mt-0.5 size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant={t.variant} className="w-full">
              <Link href="/login">{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="container pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-foreground px-8 py-16 text-center text-background md:px-16">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">Ready to go digital?</h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-background/70">
            Create your first queue in under 2 minutes. No setup fees.
          </p>
          <Button asChild size="lg" className="mt-8 bg-background px-6 text-foreground hover:bg-background/90">
            <Link href="/login">
              Get started free <ArrowRight weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/icon.png" alt="" width={18} height={18} className="rounded" />
          <span>{PLATFORM.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy &amp; Terms
          </Link>
          <p>&copy; {new Date().getFullYear()} {PLATFORM.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
