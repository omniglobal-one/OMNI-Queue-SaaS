-- ============================================================
-- OMNI Queue SaaS — Database Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null check (role in ('merchant', 'admin')) default 'merchant',
  business_name  text,
  business_slug  text unique,
  logo_url       text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_own_read"  on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- QUEUES
-- ============================================================
create table if not exists public.queues (
  id                    uuid primary key default gen_random_uuid(),
  merchant_id           uuid not null references public.profiles(id) on delete cascade,
  name                  text not null,
  slug                  text not null unique,
  description           text,
  mode                  text not null check (mode in ('auto', 'invoice')) default 'auto',
  status                text not null check (status in ('open', 'paused', 'closed')) default 'open',
  avg_service_minutes   int not null default 5 check (avg_service_minutes >= 1),
  manual_delay_minutes  int not null default 0 check (manual_delay_minutes >= 0),
  current_ticket_id     uuid,
  next_counter          int not null default 0,
  is_accepting          boolean not null default true,
  max_tickets           int,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.queues enable row level security;

-- Merchants can CRUD their own queues
create policy "queues_merchant_all"   on public.queues for all using (auth.uid() = merchant_id);
-- Anyone can read a queue by slug (for customer join page)
create policy "queues_public_read"    on public.queues for select using (true);

-- ============================================================
-- TICKETS
-- ============================================================
create table if not exists public.tickets (
  id               uuid primary key default gen_random_uuid(),
  queue_id         uuid not null references public.queues(id) on delete cascade,
  ticket_number    text not null,
  invoice_number   text,
  customer_name    text,
  customer_phone   text,
  push_subscription jsonb,
  position         int not null default 0,
  status           text not null check (status in ('pending', 'in_progress', 'completed', 'skipped')) default 'pending',
  called_at        timestamptz,
  completed_at     timestamptz,
  skipped_at       timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.tickets enable row level security;

-- Anyone can insert a ticket (public join)
create policy "tickets_public_insert" on public.tickets for insert with check (true);
-- Anyone can read tickets in a queue (for customer status page)
create policy "tickets_public_read"   on public.tickets for select using (true);
-- Only the queue's merchant can update tickets
create policy "tickets_merchant_update" on public.tickets for update
  using (
    exists (
      select 1 from public.queues q where q.id = queue_id and q.merchant_id = auth.uid()
    )
  );

-- ============================================================
-- QUEUE EVENTS
-- ============================================================
create table if not exists public.queue_events (
  id           uuid primary key default gen_random_uuid(),
  queue_id     uuid not null references public.queues(id) on delete cascade,
  ticket_id    uuid references public.tickets(id) on delete set null,
  event_type   text not null,
  actor_id     uuid references auth.users(id) on delete set null,
  payload      jsonb,
  created_at   timestamptz not null default now()
);

alter table public.queue_events enable row level security;

create policy "queue_events_merchant_read" on public.queue_events for select
  using (
    exists (
      select 1 from public.queues q where q.id = queue_id and q.merchant_id = auth.uid()
    )
  );

create policy "queue_events_insert" on public.queue_events for insert with check (true);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null unique references public.tickets(id) on delete cascade,
  queue_id   uuid not null references public.queues(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "push_subs_insert" on public.push_subscriptions for insert with check (true);
create policy "push_subs_merchant_read" on public.push_subscriptions for select
  using (
    exists (
      select 1 from public.queues q where q.id = queue_id and q.merchant_id = auth.uid()
    )
  );
create policy "push_subs_merchant_delete" on public.push_subscriptions for delete
  using (
    exists (
      select 1 from public.queues q where q.id = queue_id and q.merchant_id = auth.uid()
    )
  );

-- ============================================================
-- WHATSAPP LOG
-- ============================================================
create table if not exists public.whatsapp_log (
  id               uuid primary key default gen_random_uuid(),
  ticket_id        uuid not null references public.tickets(id) on delete cascade,
  queue_id         uuid not null references public.queues(id) on delete cascade,
  message_template text not null,
  message_body     text not null,
  sent_by          uuid references auth.users(id) on delete set null,
  sent_at          timestamptz not null default now()
);

alter table public.whatsapp_log enable row level security;

create policy "wa_log_merchant_all" on public.whatsapp_log for all
  using (
    exists (
      select 1 from public.queues q where q.id = queue_id and q.merchant_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Atomic counter increment for auto ticket numbering
create or replace function public.increment_and_get_counter(queue_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  new_counter int;
begin
  update public.queues
    set next_counter = next_counter + 1,
        updated_at = now()
    where id = queue_id
    returning next_counter into new_counter;
  return new_counter;
end;
$$;

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger trg_queues_updated_at
  before update on public.queues
  for each row execute function public.handle_updated_at();

create or replace trigger trg_tickets_updated_at
  before update on public.tickets
  for each row execute function public.handle_updated_at();

-- Auto-create profile on auth user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'merchant')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger trg_new_user_profile
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.queues;
alter publication supabase_realtime add table public.tickets;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_queues_merchant_id    on public.queues(merchant_id);
create index if not exists idx_queues_slug           on public.queues(slug);
create index if not exists idx_tickets_queue_id      on public.tickets(queue_id);
create index if not exists idx_tickets_status        on public.tickets(status);
create index if not exists idx_tickets_queue_status  on public.tickets(queue_id, status, created_at);
create index if not exists idx_queue_events_queue_id on public.queue_events(queue_id);
create index if not exists idx_push_subs_ticket_id   on public.push_subscriptions(ticket_id);
