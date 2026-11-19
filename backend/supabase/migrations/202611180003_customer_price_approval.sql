create table public.order_basket_changes (
  change_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(order_id),
  created_by_agent_id uuid not null references public.agent_profiles(agent_id),
  previous_total numeric(18,2) not null check (previous_total > 0),
  proposed_total numeric(18,2) not null check (proposed_total > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  items_snapshot jsonb not null check (jsonb_typeof(items_snapshot) = 'array'),
  reason text not null check (length(trim(reason)) between 5 and 500),
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  decided_by_user_id uuid references public.profiles(user_id),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index order_basket_changes_order_created_idx
  on public.order_basket_changes(order_id, created_at desc);
create unique index order_basket_changes_one_pending_per_order
  on public.order_basket_changes(order_id) where status = 'pending';
alter table public.order_basket_changes enable row level security;

create policy "Order parties and admins read basket changes"
  on public.order_basket_changes for select using (
    public.is_current_user_admin() or exists (
      select 1
      from public.orders o
      join public.quotes q on q.quote_id = o.quote_id
      join public.agent_profiles a on a.agent_id = q.agent_id
      where o.order_id = order_basket_changes.order_id
        and (public.current_user_is_member(o.household_id) or a.user_id = auth.uid())
    )
  );

alter table public.order_events drop constraint order_events_event_type_check;
alter table public.order_events add constraint order_events_event_type_check check (
  event_type in (
    'order_accepted','payment_funded','shopping_started','items_ready',
    'out_for_delivery','delivered','customer_confirmed','dispute_opened',
    'admin_note','basket_change_requested','basket_change_approved',
    'basket_change_declined'
  )
);

create or replace function public.vendor_update_order(p_order_id uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_agent_id uuid; v_current text; v_event text;
begin
  select a.agent_id into v_agent_id from public.agent_profiles a
    where a.user_id = auth.uid() and a.verification_status = 'verified';
  if v_agent_id is null then raise exception 'Verified vendor access required'; end if;
  select o.status into v_current from public.orders o
    join public.quotes q on q.quote_id = o.quote_id
    where o.order_id = p_order_id and q.agent_id = v_agent_id for update of o;
  if not found then raise exception 'Order not found for this vendor'; end if;
  if (v_current = 'confirmed' and p_status = 'shopping') then v_event := 'shopping_started';
  elsif (v_current = 'shopping' and p_status = 'ready_for_handoff') then v_event := 'items_ready';
  elsif (v_current = 'ready_for_handoff' and p_status = 'out_for_delivery') then v_event := 'out_for_delivery';
  elsif (v_current = 'out_for_delivery' and p_status = 'delivered') then v_event := 'delivered';
  else raise exception 'This order cannot move from % to %', v_current, p_status; end if;
  update public.orders set status = p_status where order_id = p_order_id;
  insert into public.order_events(order_id,event_type,actor_user_id,note)
    values(p_order_id,v_event,auth.uid(),nullif(trim(p_note),''));
end $$;

create or replace function public.vendor_request_basket_change(
  p_order_id uuid,
  p_items jsonb,
  p_reason text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_agent_id uuid;
  v_household_id uuid;
  v_order_status text;
  v_previous_total numeric(18,2);
  v_currency text;
  v_original_items jsonb;
  v_proposed_total numeric(18,2);
  v_change_id uuid;
begin
  select a.agent_id into v_agent_id
  from public.agent_profiles a
  where a.user_id = auth.uid() and a.verification_status = 'verified';
  if v_agent_id is null then raise exception 'Verified vendor access required'; end if;

  select o.household_id,o.status,o.total_amount,o.currency,o.items_snapshot
    into v_household_id,v_order_status,v_previous_total,v_currency,v_original_items
  from public.orders o
  join public.quotes q on q.quote_id = o.quote_id
  where o.order_id = p_order_id and q.agent_id = v_agent_id
  for update of o;
  if not found then raise exception 'Order not found for this vendor'; end if;
  if v_order_status not in ('shopping','awaiting_customer_approval') then
    raise exception 'Basket changes can only be requested while an order is being shopped';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keep at least one item in the revised basket';
  end if;
  if length(trim(coalesce(p_reason,''))) not between 5 and 500 then
    raise exception 'Explain the basket change in 5 to 500 characters';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as x(item_name text,quantity numeric,unit text,unit_price numeric,availability text,proposed_substitution text)
    where nullif(trim(x.item_name),'') is null or nullif(trim(x.unit),'') is null
      or x.quantity is null or x.quantity <= 0 or x.unit_price is null or x.unit_price < 0
      or x.availability is null or x.availability not in ('available','unavailable','substitution')
      or (x.availability = 'unavailable' and x.unit_price <> 0)
      or (x.availability <> 'unavailable' and x.unit_price <= 0)
      or (x.availability = 'substitution' and length(trim(coalesce(x.proposed_substitution,''))) not between 2 and 120)
  ) then raise exception 'The revised basket contains invalid item details'; end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as x(item_name text,quantity numeric,unit text)
    group by lower(trim(x.item_name)),x.unit
    having sum(x.quantity) > coalesce((
      select sum((original->>'quantity')::numeric)
      from jsonb_array_elements(v_original_items) original
      where lower(trim(original->>'item_name')) = lower(trim(x.item_name))
        and original->>'unit' = x.unit
    ),0)
  ) then raise exception 'Only requested items can be revised or removed'; end if;
  select round(sum(case when x.availability = 'unavailable' then 0 else x.quantity * x.unit_price end),2)
    into v_proposed_total
  from jsonb_to_recordset(p_items) as x(quantity numeric,unit_price numeric,availability text);
  if coalesce(v_proposed_total,0) <= 0 then raise exception 'The revised basket must include at least one priced item'; end if;
  if exists (
    select 1 from public.order_basket_changes
    where order_id = p_order_id and status = 'pending'
  ) then raise exception 'A basket change is already waiting for household approval'; end if;

  insert into public.order_basket_changes(
    order_id,created_by_agent_id,previous_total,proposed_total,currency,items_snapshot,reason
  ) values (
    p_order_id,v_agent_id,v_previous_total,v_proposed_total,v_currency,p_items,trim(p_reason)
  ) returning change_id into v_change_id;
  update public.orders set status = 'awaiting_customer_approval' where order_id = p_order_id;
  insert into public.order_events(order_id,event_type,actor_user_id,note)
    values(p_order_id,'basket_change_requested',auth.uid(),trim(p_reason));
  insert into public.notifications(user_id,event_type,payload)
    select m.user_id,'basket_change_requested',
      jsonb_build_object('order_id',p_order_id,'change_id',v_change_id,'proposed_total',v_proposed_total)
    from public.household_members m where m.household_id = v_household_id;
  return v_change_id;
end $$;

create or replace function public.household_decide_basket_change(
  p_change_id uuid,
  p_approve boolean
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_household_id uuid;
  v_order_status text;
  v_change public.order_basket_changes%rowtype;
begin
  select * into v_change
  from public.order_basket_changes
  where change_id = p_change_id
  for update;
  if not found then raise exception 'Basket change not found'; end if;

  select o.order_id,o.household_id,o.status
    into v_order_id,v_household_id,v_order_status
  from public.orders o
  where o.order_id = v_change.order_id
  for update;
  if not public.current_user_is_member(v_household_id) then raise exception 'Household access required'; end if;
  if v_change.status <> 'pending' or v_order_status <> 'awaiting_customer_approval' then
    raise exception 'This basket change is no longer waiting for approval'; end if;

  if p_approve then
    update public.orders
      set items_snapshot = v_change.items_snapshot,
          total_amount = v_change.proposed_total,
          status = 'shopping'
      where order_id = v_order_id;
    update public.order_basket_changes
      set status = 'approved',decided_by_user_id = auth.uid(),decided_at = now()
      where change_id = p_change_id;
    insert into public.order_events(order_id,event_type,actor_user_id,note)
      values(v_order_id,'basket_change_approved',auth.uid(),'Household approved the revised basket and total');
  else
    update public.order_basket_changes
      set status = 'declined',decided_by_user_id = auth.uid(),decided_at = now()
      where change_id = p_change_id;
    insert into public.order_events(order_id,event_type,actor_user_id,note)
      values(v_order_id,'basket_change_declined',auth.uid(),'Household declined; vendor must revise and resubmit');
  end if;
end $$;

revoke all on function public.vendor_request_basket_change(uuid,jsonb,text) from public;
grant execute on function public.vendor_request_basket_change(uuid,jsonb,text) to authenticated;
revoke all on function public.household_decide_basket_change(uuid,boolean) from public;
grant execute on function public.household_decide_basket_change(uuid,boolean) to authenticated;
