-- Operational controls for the vendor, household and admin workspaces.
-- Admin membership is granted only by a trusted database operator.
create table public.admin_users (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(user_id)
);
alter table public.admin_users enable row level security;

create or replace function public.is_current_user_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid())
$$;
revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

create table public.order_events (
  order_event_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(order_id) on delete cascade,
  event_type text not null check (event_type in ('order_accepted','payment_funded','shopping_started','items_ready','out_for_delivery','delivered','customer_confirmed','dispute_opened','admin_note')),
  actor_user_id uuid references public.profiles(user_id),
  note text,
  occurred_at timestamptz not null default now()
);
create index order_events_timeline_idx on public.order_events(order_id, occurred_at);
alter table public.order_events enable row level security;
create policy "Order parties and admins read timeline" on public.order_events for select using (
  public.is_current_user_admin() or exists(
    select 1 from public.orders o
    left join public.quotes q on q.quote_id = o.quote_id
    left join public.agent_profiles a on a.agent_id = q.agent_id
    where o.order_id = order_events.order_id
      and (public.current_user_is_member(o.household_id) or a.user_id = auth.uid())
  )
);

alter table public.orders add constraint orders_status_check check (status in (
  'awaiting_payment','confirmed','shopping','awaiting_customer_approval',
  'ready_for_handoff','out_for_delivery','delivered','completed','disputed','resolved','cancelled'
));
create index orders_status_created_idx on public.orders(status, created_at desc);
create index agent_profiles_verification_idx on public.agent_profiles(verification_status, created_at desc);

create or replace function public.record_new_order_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.order_events(order_id,event_type,actor_user_id,note)
    values(new.order_id,'order_accepted',new.accepted_by_user_id,'Quote accepted; awaiting payment confirmation');
  return new;
end $$;
create trigger orders_record_accepted_event after insert on public.orders
for each row execute function public.record_new_order_event();

create or replace function public.reject_order_event_mutation()
returns trigger language plpgsql as $$
begin raise exception 'Order timeline is append-only'; end $$;
create trigger order_events_no_update_delete before update or delete on public.order_events
for each row execute function public.reject_order_event_mutation();
create trigger order_events_no_truncate before truncate on public.order_events
for each statement execute function public.reject_order_event_mutation();

do $$
declare t text;
begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['orders','order_events','disputes','agent_profiles'] loop
      if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;

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
  elsif (v_current in ('shopping','awaiting_customer_approval') and p_status = 'ready_for_handoff') then v_event := 'items_ready';
  elsif (v_current = 'ready_for_handoff' and p_status = 'out_for_delivery') then v_event := 'out_for_delivery';
  elsif (v_current = 'out_for_delivery' and p_status = 'delivered') then v_event := 'delivered';
  else raise exception 'This order cannot move from % to %', v_current, p_status; end if;
  update public.orders set status = p_status where order_id = p_order_id;
  insert into public.order_events(order_id,event_type,actor_user_id,note)
    values(p_order_id,v_event,auth.uid(),nullif(trim(p_note),''));
end $$;

create or replace function public.household_confirm_delivery(p_order_id uuid, p_issue text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_household uuid; v_status text;
begin
  select household_id,status into v_household,v_status from public.orders where order_id = p_order_id for update;
  if not found or not public.current_user_is_member(v_household) then raise exception 'Household access required'; end if;
  if v_status <> 'delivered' then raise exception 'Only a delivered order can be confirmed'; end if;
  if nullif(trim(p_issue),'') is not null then
    insert into public.disputes(order_id,opened_by_user_id,reason,description,status)
      values(p_order_id,auth.uid(),'delivery_issue',trim(p_issue),'open');
    update public.orders set status = 'disputed' where order_id = p_order_id;
    insert into public.order_events(order_id,event_type,actor_user_id,note)
      values(p_order_id,'dispute_opened',auth.uid(),'Household reported a delivery issue');
  else
    update public.orders set status = 'completed' where order_id = p_order_id;
    insert into public.order_events(order_id,event_type,actor_user_id,note)
      values(p_order_id,'customer_confirmed',auth.uid(),'Delivery confirmed by household');
  end if;
end $$;

create or replace function public.admin_verify_vendor(p_agent_id uuid, p_status public.verification_status)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_current_user_admin() then raise exception 'Admin access required'; end if;
  if p_status not in ('verified','rejected','suspended') then raise exception 'Invalid review outcome'; end if;
  update public.agent_profiles set verification_status = p_status where agent_id = p_agent_id and verification_status = 'pending';
  if not found then raise exception 'Pending vendor application not found'; end if;
end $$;

create or replace function public.admin_resolve_dispute(p_dispute_id uuid, p_resolution text)
returns void language plpgsql security definer set search_path = public as $$
declare v_order uuid;
begin
  if not public.is_current_user_admin() then raise exception 'Admin access required'; end if;
  if length(trim(coalesce(p_resolution,''))) < 5 then raise exception 'Add a resolution note'; end if;
  select order_id into v_order from public.disputes where dispute_id = p_dispute_id and status in ('open','under_review') for update;
  if not found then raise exception 'Open dispute not found'; end if;
  update public.disputes set status = 'resolved', resolution = trim(p_resolution), resolved_at = now()
    where dispute_id = p_dispute_id;
  update public.orders set status = 'resolved' where order_id = v_order and status = 'disputed';
  insert into public.order_events(order_id,event_type,actor_user_id,note)
    values(v_order,'admin_note',auth.uid(),trim(p_resolution));
end $$;

-- Admin reads are scoped by an operator-granted membership; browser clients
-- cannot grant themselves access or directly change vendor/order/payment state.
create policy "Admins read profiles" on public.profiles for select using (public.is_current_user_admin());
create policy "Admins read all households" on public.households for select using (public.is_current_user_admin());
create policy "Admins read all memberships" on public.household_members for select using (public.is_current_user_admin());
create policy "Admins read all vendors" on public.agent_profiles for select using (public.is_current_user_admin());
create policy "Admins read all requests" on public.shopping_requests for select using (public.is_current_user_admin());
create policy "Admins read all request items" on public.request_items for select using (public.is_current_user_admin());
create policy "Admins read all request inputs" on public.request_inputs for select using (public.is_current_user_admin());
create policy "Admins read all quotes" on public.quotes for select using (public.is_current_user_admin());
create policy "Admins read all quote items" on public.quote_items for select using (public.is_current_user_admin());
create policy "Admins read all orders" on public.orders for select using (public.is_current_user_admin());
create policy "Admins read all disputes" on public.disputes for select using (public.is_current_user_admin());
create policy "Admins read all escrow payments" on public.escrow_payments for select using (public.is_current_user_admin());
create policy "Admins read all payouts" on public.agent_payouts for select using (public.is_current_user_admin());
create policy "Admins read all refunds" on public.refunds for select using (public.is_current_user_admin());
create policy "Admins read all payment transactions" on public.payment_transactions for select using (public.is_current_user_admin());

revoke all on function public.vendor_update_order(uuid,text,text) from public;
grant execute on function public.vendor_update_order(uuid,text,text) to authenticated;
revoke all on function public.household_confirm_delivery(uuid,text) from public;
grant execute on function public.household_confirm_delivery(uuid,text) to authenticated;
revoke all on function public.admin_verify_vendor(uuid,public.verification_status) from public;
grant execute on function public.admin_verify_vendor(uuid,public.verification_status) to authenticated;
revoke all on function public.admin_resolve_dispute(uuid,text) from public;
grant execute on function public.admin_resolve_dispute(uuid,text) to authenticated;
