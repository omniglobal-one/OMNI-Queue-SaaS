-- Fixes a race condition: callNext used to run several independent, unlocked statements
-- (find next ticket, complete current, transition next) — concurrent calls (double-click, two
-- staff sessions on the same merchant account) could both select the same "next" ticket and
-- both fire duplicate push notifications / audit events. This function does the whole
-- transition atomically inside one transaction, locking the queue row first so only one
-- caller can ever proceed past the lock at a time.

create or replace function public.call_next_ticket(p_queue_id uuid, p_merchant_id uuid, p_actor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue record;
  v_next record;
  v_up_next record;
  v_called_at timestamptz := now();
begin
  select id, slug, status, current_ticket_id into v_queue
    from queues where id = p_queue_id and merchant_id = p_merchant_id
    for update;

  if not found then
    return jsonb_build_object('error', 'Queue not found');
  end if;
  if v_queue.status != 'open' then
    return jsonb_build_object('error', 'Queue is not open');
  end if;

  select * into v_next from tickets
    where queue_id = p_queue_id and status = 'pending'
    order by created_at asc limit 1;

  if not found then
    return jsonb_build_object('error', 'NO_PENDING_TICKETS');
  end if;

  select * into v_up_next from tickets
    where queue_id = p_queue_id and status = 'pending' and id != v_next.id
    order by created_at asc limit 1;

  if v_queue.current_ticket_id is not null then
    update tickets set status = 'completed', completed_at = v_called_at, updated_at = v_called_at
      where id = v_queue.current_ticket_id;
    insert into queue_events (queue_id, ticket_id, event_type, actor_id, payload)
      values (p_queue_id, v_queue.current_ticket_id, 'completed', p_actor_id, '{}'::jsonb);
  end if;

  update tickets set status = 'in_progress', called_at = v_called_at, updated_at = v_called_at
    where id = v_next.id;

  update queues set current_ticket_id = v_next.id, updated_at = v_called_at
    where id = p_queue_id;

  insert into queue_events (queue_id, ticket_id, event_type, actor_id, payload)
    values (p_queue_id, v_next.id, 'called_next', p_actor_id, jsonb_build_object('ticket_number', v_next.ticket_number));

  -- v_next/v_up_next were captured by SELECT before the UPDATEs above ran, so merge in the
  -- post-transition field values rather than returning the stale pre-update snapshot.
  return jsonb_build_object(
    'queue_slug', v_queue.slug,
    'called', to_jsonb(v_next) || jsonb_build_object('status', 'in_progress', 'called_at', v_called_at, 'updated_at', v_called_at),
    'up_next', case when v_up_next.id is not null then to_jsonb(v_up_next) else null end
  );
end;
$$;

revoke execute on function public.call_next_ticket(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.call_next_ticket(uuid, uuid, uuid) to service_role;
