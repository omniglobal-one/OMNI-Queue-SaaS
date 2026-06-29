ALTER TABLE public.queues
  ADD COLUMN IF NOT EXISTS passcode varchar(4) DEFAULT NULL;
