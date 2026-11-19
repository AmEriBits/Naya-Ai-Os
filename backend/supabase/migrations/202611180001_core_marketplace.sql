create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'adult', 'helper', 'viewer');
create type public.request_status as enum ('draft', 'published', 'quoted', 'accepted', 'expired', 'cancelled');
create type public.quote_status as enum ('submitted', 'accepted', 'rejected', 'expired', 'withdrawn');
create type public.verification_status as enum ('pending', 'verified', 'rejected', 'suspended');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(user_id, full_name, phone)
    values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.phone)
    on conflict(user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create table public.households (
  household_id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  delivery_address text not null,
  service_area text not null,
  family_size integer not null check (family_size between 1 and 30),
  created_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now()
);

create table public.household_members (
  membership_id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(household_id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  role public.member_role not null default 'owner',
  can_approve_spending boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table public.agent_profiles (
  agent_id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(user_id) on delete cascade,
  business_name text not null check (length(trim(business_name)) > 0),
  agent_type text not null default 'market_vendor',
  verification_status public.verification_status not null default 'pending',
  service_area text not null,
  rating_average numeric(3,2) check (rating_average between 0 and 5),
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.shopping_requests (
  request_id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(household_id),
  created_by_user_id uuid not null references public.profiles(user_id),
  title text not null,
  input_type text not null default 'typed' check (input_type in ('typed','voice','photo','meal_plan')),
  budget_limit numeric(18,2) check (budget_limit is null or budget_limit > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  status public.request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.request_items (
  request_item_id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.shopping_requests(request_id) on delete cascade,
  item_name text not null check (length(trim(item_name)) > 0),
  quantity numeric(12,3) not null check (quantity > 0),
  unit text not null,
  preferred_brand text,
  substitution_allowed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table public.request_inputs (
  request_id uuid primary key references public.shopping_requests(request_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(user_id),
  raw_input text not null check (length(trim(raw_input)) between 1 and 4000),
  ai_parse_note text,
  created_at timestamptz not null default now()
);

create table public.quotes (
  quote_id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.shopping_requests(request_id),
  agent_id uuid not null references public.agent_profiles(agent_id),
  total_amount numeric(18,2) not null check (total_amount > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  delivery_estimate timestamptz,
  note text,
  status public.quote_status not null default 'submitted',
  expires_at timestamptz not null default now() + interval '30 minutes',
  created_at timestamptz not null default now(),
  unique (request_id, agent_id)
);

create table public.quote_items (
  quote_item_id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(quote_id) on delete cascade,
  request_item_id uuid not null references public.request_items(request_item_id),
  item_name text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit text not null,
  unit_price numeric(18,2) not null check (unit_price >= 0),
  availability text not null check (availability in ('available','partial','unavailable','substitution')),
  proposed_substitution text,
  household_approval_required boolean not null default false,
  unique (quote_id, request_item_id)
);

create table public.orders (
  order_id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(household_id),
  quote_id uuid not null unique references public.quotes(quote_id),
  items_snapshot jsonb not null,
  total_amount numeric(18,2) not null check (total_amount > 0),
  currency text not null default 'NGN',
  status text not null default 'awaiting_payment',
  accepted_by_user_id uuid not null references public.profiles(user_id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  notification_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  channel text not null default 'in_app' check (channel in ('in_app','push','sms')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.ai_request_usage (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  usage_date date not null default (now() at time zone 'utc')::date,
  request_count integer not null default 0 check (request_count between 1 and 30),
  primary key (user_id, usage_date)
);

create table public.disputes (
  dispute_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(order_id),
  opened_by_user_id uuid not null references public.profiles(user_id),
  reason text not null,
  description text not null check (length(trim(description)) > 0),
  evidence_urls jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','under_review','resolved','rejected','closed')),
  resolution text,
  refund_amount numeric(18,2) check (refund_amount is null or refund_amount >= 0),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.escrow_payments (
  escrow_payment_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(order_id),
  provider text not null,
  provider_reference text,
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending' check (status in ('pending','funded','partially_released','released','partially_refunded','refunded','failed','cancelled')),
  idempotency_key text not null unique,
  funded_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_reference),
  unique (escrow_payment_id, currency),
  check (released_at is null or funded_at is not null),
  check (released_at is null or released_at >= funded_at)
);

create table public.agent_payouts (
  payout_id uuid primary key default gen_random_uuid(),
  escrow_payment_id uuid not null,
  agent_id uuid not null references public.agent_profiles(agent_id),
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'NGN',
  provider text not null,
  provider_reference text,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending','processing','succeeded','failed','cancelled','reversed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  foreign key (escrow_payment_id,currency) references public.escrow_payments(escrow_payment_id,currency),
  unique (provider,provider_reference),
  unique (payout_id,escrow_payment_id),
  check (status <> 'succeeded' or paid_at is not null),
  check (paid_at is null or paid_at >= created_at)
);

create table public.refunds (
  refund_id uuid primary key default gen_random_uuid(),
  escrow_payment_id uuid not null,
  dispute_id uuid references public.disputes(dispute_id),
  requested_by_user_id uuid not null references public.profiles(user_id),
  approved_by_user_id uuid references public.profiles(user_id),
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'NGN',
  reason text not null check (length(trim(reason)) > 0),
  status text not null default 'requested' check (status in ('requested','approved','processing','succeeded','failed','rejected','cancelled')),
  idempotency_key text not null unique,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  completed_at timestamptz,
  foreign key (escrow_payment_id,currency) references public.escrow_payments(escrow_payment_id,currency),
  unique (refund_id,escrow_payment_id),
  check ((approved_by_user_id is null) = (approved_at is null)),
  check (status not in ('approved','processing','succeeded') or approved_at is not null),
  check (status <> 'succeeded' or completed_at is not null),
  check (approved_at is null or approved_at >= requested_at),
  check (completed_at is null or completed_at >= requested_at)
);

create table public.payment_transactions (
  transaction_id uuid primary key default gen_random_uuid(),
  escrow_payment_id uuid not null,
  payout_id uuid,
  refund_id uuid,
  related_transaction_id uuid,
  transaction_type text not null check (transaction_type in ('collection','escrow_release','payout','refund','reversal')),
  event_type text not null check (event_type in ('initiated','pending','succeeded','failed','reversed')),
  attempt_number integer not null default 1 check (attempt_number >= 1),
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'NGN',
  provider text not null,
  provider_reference text,
  idempotency_key text not null,
  event_key text not null unique,
  failure_code text,
  occurred_at timestamptz not null default now(),
  recorded_at timestamptz not null default now(),
  unique (transaction_id,escrow_payment_id),
  foreign key (escrow_payment_id,currency) references public.escrow_payments(escrow_payment_id,currency),
  foreign key (payout_id,escrow_payment_id) references public.agent_payouts(payout_id,escrow_payment_id),
  foreign key (refund_id,escrow_payment_id) references public.refunds(refund_id,escrow_payment_id),
  foreign key (related_transaction_id,escrow_payment_id) references public.payment_transactions(transaction_id,escrow_payment_id),
  check (num_nonnulls(payout_id,refund_id) <= 1),
  check ((transaction_type = 'payout' and payout_id is not null and refund_id is null)
    or (transaction_type = 'refund' and refund_id is not null and payout_id is null)
    or (transaction_type in ('collection','escrow_release') and payout_id is null and refund_id is null)
    or transaction_type = 'reversal'),
  check (transaction_type <> 'reversal' or related_transaction_id is not null),
  check (related_transaction_id is null or related_transaction_id <> transaction_id),
  check (failure_code is null or event_type = 'failed')
);

create index escrow_payments_order_idx on public.escrow_payments(order_id);
create index agent_payouts_escrow_idx on public.agent_payouts(escrow_payment_id);
create index agent_payouts_agent_idx on public.agent_payouts(agent_id);
create index refunds_escrow_idx on public.refunds(escrow_payment_id);
create index refunds_dispute_idx on public.refunds(dispute_id) where dispute_id is not null;
create index payment_transactions_history_idx on public.payment_transactions(escrow_payment_id,occurred_at,recorded_at);
create index payment_transactions_payout_idx on public.payment_transactions(payout_id) where payout_id is not null;
create index payment_transactions_refund_idx on public.payment_transactions(refund_id) where refund_id is not null;
create index payment_transactions_related_idx on public.payment_transactions(related_transaction_id) where related_transaction_id is not null;
create index payment_transactions_operation_idx on public.payment_transactions(provider,idempotency_key,attempt_number);

create or replace function public.reject_payment_history_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Payment history is append-only; insert a new event';
end $$;

create trigger payment_history_no_update_delete before update or delete on public.payment_transactions
for each row execute function public.reject_payment_history_mutation();
create trigger payment_history_no_truncate before truncate on public.payment_transactions
for each statement execute function public.reject_payment_history_mutation();

create index shopping_requests_household_recent_idx on public.shopping_requests(household_id, created_at desc);
create index shopping_requests_queue_idx on public.shopping_requests(status, created_at) where status = 'published';
create index quotes_request_status_idx on public.quotes(request_id, status, created_at desc);
create index notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;

create or replace function public.current_user_is_member(p_household_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.household_members m where m.household_id = p_household_id and m.user_id = auth.uid())
$$;

create or replace function public.current_user_is_verified_agent()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.agent_profiles a where a.user_id = auth.uid() and a.verification_status = 'verified' and a.available)
$$;

create or replace function public.consume_ai_request()
returns boolean language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.ai_request_usage(user_id, usage_date, request_count)
    values(auth.uid(), (now() at time zone 'utc')::date, 1)
    on conflict(user_id, usage_date) do update set request_count = public.ai_request_usage.request_count + 1
      where public.ai_request_usage.request_count < 30
    returning request_count into v_count;
  return v_count is not null;
end $$;

revoke all on function public.current_user_is_member(uuid) from public;
grant execute on function public.current_user_is_member(uuid) to authenticated;
revoke all on function public.current_user_is_verified_agent() from public;
grant execute on function public.current_user_is_verified_agent() to authenticated;

create or replace function public.create_household(p_name text, p_address text, p_service_area text, p_family_size integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_household_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(coalesce(p_name,''))) = 0 or length(trim(coalesce(p_address,''))) = 0 or length(trim(coalesce(p_service_area,''))) = 0 then raise exception 'Name, address, and service area are required'; end if;
  if p_family_size < 1 or p_family_size > 30 then raise exception 'Family size must be between 1 and 30'; end if;
  insert into public.profiles(user_id) values(auth.uid()) on conflict(user_id) do nothing;
  insert into public.households(name, delivery_address, service_area, family_size, created_by)
    values(trim(p_name), trim(p_address), trim(p_service_area), p_family_size, auth.uid()) returning household_id into v_household_id;
  insert into public.household_members(household_id, user_id, role, can_approve_spending)
    values(v_household_id, auth.uid(), 'owner', true);
  return v_household_id;
end $$;

create or replace function public.create_shopping_request(p_title text, p_budget_limit numeric, p_raw_input text, p_ai_parse_note text, p_items jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_household_id uuid; v_request_id uuid; v_item_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select household_id into v_household_id from public.household_members where user_id = auth.uid() order by joined_at limit 1;
  if v_household_id is null then raise exception 'Create or join a household before sending a request'; end if;
  if length(trim(coalesce(p_title,''))) = 0 or length(trim(p_title)) > 240 then raise exception 'Enter a short request title'; end if;
  if length(trim(coalesce(p_raw_input,''))) < 1 or length(trim(p_raw_input)) > 4000 then raise exception 'Your original list is required'; end if;
  if p_budget_limit is not null and p_budget_limit <= 0 then raise exception 'Budget must be greater than zero'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 100 then raise exception 'Add between 1 and 100 items'; end if;
  if exists(select 1 from jsonb_to_recordset(p_items) as x(item_name text, quantity numeric, unit text, preferred_brand text, substitution_allowed boolean)
    where length(trim(coalesce(x.item_name,''))) = 0 or x.quantity is null or x.quantity <= 0 or x.unit is null or length(trim(x.unit)) = 0) then raise exception 'Each item needs a name, positive quantity, and unit'; end if;
  insert into public.shopping_requests(household_id, created_by_user_id, title, input_type, budget_limit, currency, status)
    values(v_household_id, auth.uid(), trim(p_title), 'typed', p_budget_limit, 'NGN', 'published') returning request_id into v_request_id;
  insert into public.request_inputs(request_id, created_by_user_id, raw_input, ai_parse_note)
    values(v_request_id, auth.uid(), p_raw_input, nullif(trim(p_ai_parse_note),''));
  insert into public.request_items(request_id, item_name, quantity, unit, preferred_brand, substitution_allowed)
    select v_request_id, trim(x.item_name), x.quantity, trim(x.unit), nullif(trim(x.preferred_brand),''), coalesce(x.substitution_allowed,false)
    from jsonb_to_recordset(p_items) as x(item_name text, quantity numeric, unit text, preferred_brand text, substitution_allowed boolean);
  insert into public.notifications(user_id, event_type, payload)
    select a.user_id, 'request_published', jsonb_build_object('request_id',v_request_id)
    from public.agent_profiles a join public.households h on h.household_id = v_household_id
    where a.verification_status = 'verified' and a.available and lower(trim(a.service_area)) = lower(trim(h.service_area));
  return v_request_id;
end $$;

create or replace function public.submit_quote(p_request_id uuid, p_items jsonb, p_eta_minutes integer, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_agent_id uuid; v_quote_id uuid; v_request public.shopping_requests%rowtype; v_total numeric(18,2); v_item_count integer;
begin
  select * into v_request from public.shopping_requests where request_id = p_request_id for update;
  if not found or v_request.status not in ('published','quoted') then raise exception 'This request is no longer open'; end if;
  select a.agent_id into v_agent_id from public.agent_profiles a
    where a.user_id = auth.uid() and a.verification_status = 'verified' and a.available
      and lower(trim(a.service_area)) = lower(trim((select h.service_area from public.households h where h.household_id = v_request.household_id)));
  if v_agent_id is null then raise exception 'A verified, available vendor profile is required'; end if;
  if p_eta_minutes < 5 or p_eta_minutes > 1440 or jsonb_typeof(p_items) <> 'array' then raise exception 'Enter item prices and a valid delivery estimate'; end if;
  select count(*) into v_item_count from public.request_items where request_id = p_request_id;
  if v_item_count = 0 or jsonb_array_length(p_items) <> v_item_count then raise exception 'Add availability for every requested item'; end if;
  if exists(select 1 from jsonb_to_recordset(p_items) as x(request_item_id uuid, unit_price numeric, availability text)
      where x.unit_price < 0 or x.availability not in ('available','unavailable')) then raise exception 'Invalid item price or availability'; end if;
  if exists(select 1 from jsonb_to_recordset(p_items) as x(request_item_id uuid, unit_price numeric, availability text)
      left join public.request_items ri on ri.request_item_id = x.request_item_id and ri.request_id = p_request_id where ri.request_item_id is null) then raise exception 'Quote contains an item outside this request'; end if;
  if exists(select 1 from jsonb_to_recordset(p_items) as x(request_item_id uuid, unit_price numeric, availability text)
      where (x.availability = 'unavailable' and x.unit_price <> 0) or (x.availability = 'available' and x.unit_price <= 0)) then raise exception 'Available items need a price; unavailable items must be zero'; end if;
  select round(sum(x.unit_price * ri.quantity),2) into v_total
    from jsonb_to_recordset(p_items) as x(request_item_id uuid, unit_price numeric, availability text)
    join public.request_items ri on ri.request_item_id = x.request_item_id and ri.request_id = p_request_id;
  if v_total <= 0 then raise exception 'A quote must include at least one priced item'; end if;
  insert into public.quotes(request_id, agent_id, total_amount, currency, delivery_estimate, note, status, expires_at)
    values(p_request_id, v_agent_id, v_total, v_request.currency, now() + make_interval(mins => p_eta_minutes), nullif(trim(p_note),''), 'submitted', now() + interval '30 minutes')
    on conflict(request_id, agent_id) do update set total_amount = excluded.total_amount, delivery_estimate = excluded.delivery_estimate,
      note = excluded.note, status = 'submitted', expires_at = excluded.expires_at, created_at = now()
    returning quote_id into v_quote_id;
  delete from public.quote_items where quote_id = v_quote_id;
  insert into public.quote_items(quote_id, request_item_id, item_name, quantity, unit, unit_price, availability)
    select v_quote_id, ri.request_item_id, ri.item_name, ri.quantity, ri.unit, x.unit_price, x.availability
      from jsonb_to_recordset(p_items) as x(request_item_id uuid, unit_price numeric, availability text)
      join public.request_items ri on ri.request_item_id = x.request_item_id and ri.request_id = p_request_id;
  update public.shopping_requests set status = 'quoted', updated_at = now() where request_id = p_request_id and status = 'published';
  insert into public.notifications(user_id, event_type, payload)
    select m.user_id, 'quote_received', jsonb_build_object('request_id',p_request_id,'quote_id',v_quote_id)
    from public.household_members m where m.household_id = v_request.household_id;
  return v_quote_id;
end $$;

create or replace function public.accept_quote(p_quote_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_quote public.quotes%rowtype; v_request public.shopping_requests%rowtype; v_order_id uuid; v_snapshot jsonb;
begin
  select * into v_quote from public.quotes where quote_id = p_quote_id for update;
  if not found or v_quote.status <> 'submitted' or v_quote.expires_at <= now() then raise exception 'This quote is no longer available'; end if;
  select * into v_request from public.shopping_requests where request_id = v_quote.request_id for update;
  if not public.current_user_is_member(v_request.household_id) then raise exception 'Household access required'; end if;
  if v_request.status not in ('published','quoted') then raise exception 'This request already has an outcome'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('item_name',ri.item_name,'quantity',ri.quantity,'unit',ri.unit,'preferred_brand',ri.preferred_brand,'unit_price',qi.unit_price,'availability',qi.availability,'proposed_substitution',qi.proposed_substitution) order by ri.created_at), '[]'::jsonb)
    into v_snapshot from public.request_items ri left join public.quote_items qi on qi.request_item_id = ri.request_item_id and qi.quote_id = p_quote_id where ri.request_id = v_request.request_id;
  insert into public.orders(household_id, quote_id, items_snapshot, total_amount, currency, accepted_by_user_id)
    values(v_request.household_id, p_quote_id, v_snapshot, v_quote.total_amount, v_quote.currency, auth.uid()) returning order_id into v_order_id;
  update public.quotes set status = case when quote_id = p_quote_id then 'accepted'::public.quote_status else 'rejected'::public.quote_status end where request_id = v_request.request_id and status = 'submitted';
  update public.shopping_requests set status = 'accepted', updated_at = now() where request_id = v_request.request_id;
  insert into public.notifications(user_id, event_type, payload)
    select a.user_id, 'quote_accepted', jsonb_build_object('request_id',v_request.request_id,'order_id',v_order_id)
    from public.agent_profiles a where a.agent_id = v_quote.agent_id;
  return v_order_id;
end $$;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.shopping_requests enable row level security;
alter table public.request_items enable row level security;
alter table public.request_inputs enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_request_usage enable row level security;
alter table public.disputes enable row level security;
alter table public.escrow_payments enable row level security;
alter table public.agent_payouts enable row level security;
alter table public.refunds enable row level security;
alter table public.payment_transactions enable row level security;

create policy "Users can read own profile" on public.profiles for select using (user_id = auth.uid());
create policy "Users can update own profile" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Members read household" on public.households for select using (public.current_user_is_member(household_id));
create policy "Members read memberships" on public.household_members for select using (public.current_user_is_member(household_id));
create policy "Users read own agent profile" on public.agent_profiles for select using (user_id = auth.uid());
create policy "Households read agent identity for quotes" on public.agent_profiles for select using (verification_status = 'verified' and exists(
  select 1 from public.quotes q join public.shopping_requests r using(request_id)
  where q.agent_id = agent_profiles.agent_id and public.current_user_is_member(r.household_id)
));
create policy "Users create own agent profile" on public.agent_profiles for insert with check (user_id = auth.uid() and verification_status = 'pending');
create policy "Users update own pending agent profile" on public.agent_profiles for update using (user_id = auth.uid() and verification_status = 'pending') with check (user_id = auth.uid() and verification_status = 'pending');
create policy "Household members read requests" on public.shopping_requests for select using (public.current_user_is_member(household_id));
create policy "Verified vendors read matching published requests" on public.shopping_requests for select using (
  status in ('published','quoted') and public.current_user_is_verified_agent() and exists(
    select 1 from public.households h join public.agent_profiles a on a.user_id = auth.uid()
    where h.household_id = shopping_requests.household_id and a.verification_status = 'verified' and a.available
      and lower(trim(h.service_area)) = lower(trim(a.service_area))
  )
);
create policy "Household members create requests" on public.shopping_requests for insert with check (created_by_user_id = auth.uid() and public.current_user_is_member(household_id) and status = 'published');
create policy "Household members read request items" on public.request_items for select using (
  exists (
    select 1
    from public.shopping_requests r
    where r.request_id = request_items.request_id
      and (
        public.current_user_is_member(r.household_id)
        or (
          r.status in ('published','quoted')
          and public.current_user_is_verified_agent()
          and exists (
            select 1
            from public.households h
            join public.agent_profiles a on a.user_id = auth.uid()
            where h.household_id = r.household_id
              and lower(trim(h.service_area)) = lower(trim(a.service_area))
          )
        )
      )
  )
);
create policy "Household members read original request input" on public.request_inputs for select using (exists(select 1 from public.shopping_requests r where r.request_id = request_inputs.request_id and public.current_user_is_member(r.household_id)));
create policy "Household members create request items" on public.request_items for insert with check (exists(select 1 from public.shopping_requests r where r.request_id = request_items.request_id and public.current_user_is_member(r.household_id) and r.created_by_user_id = auth.uid() and r.status = 'published'));
create policy "Households and quoting vendors read quotes" on public.quotes for select using (exists(select 1 from public.shopping_requests r where r.request_id = quotes.request_id and public.current_user_is_member(r.household_id)) or agent_id in (select a.agent_id from public.agent_profiles a where a.user_id = auth.uid()));
create policy "Quote parties read quote items" on public.quote_items for select using (exists(select 1 from public.quotes q join public.shopping_requests r using(request_id) where q.quote_id = quote_items.quote_id and (public.current_user_is_member(r.household_id) or q.agent_id in (select a.agent_id from public.agent_profiles a where a.user_id = auth.uid()))));
create policy "Household members read orders" on public.orders for select using (public.current_user_is_member(household_id));
create policy "Order vendor reads accepted order" on public.orders for select using (exists(select 1 from public.quotes q join public.agent_profiles a using(agent_id) where q.quote_id = orders.quote_id and a.user_id = auth.uid()));
create policy "Users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Households read dispute records" on public.disputes for select using (exists(select 1 from public.orders o where o.order_id = disputes.order_id and public.current_user_is_member(o.household_id)));
create policy "Households and order vendors read payment status" on public.escrow_payments for select using (exists(
  select 1 from public.orders o left join public.quotes q on q.quote_id = o.quote_id left join public.agent_profiles a on a.agent_id = q.agent_id
  where o.order_id = escrow_payments.order_id and (public.current_user_is_member(o.household_id) or a.user_id = auth.uid())
));
create policy "Vendors read own payout records" on public.agent_payouts for select using (agent_id in (select a.agent_id from public.agent_profiles a where a.user_id = auth.uid()));
create policy "Households read their refund status" on public.refunds for select using (exists(
  select 1 from public.escrow_payments e join public.orders o using(order_id)
  where e.escrow_payment_id = refunds.escrow_payment_id and public.current_user_is_member(o.household_id)
));
create policy "Payment parties read transaction history" on public.payment_transactions for select using (exists(
  select 1 from public.escrow_payments e join public.orders o using(order_id)
  left join public.quotes q on q.quote_id = o.quote_id left join public.agent_profiles a on a.agent_id = q.agent_id
  where e.escrow_payment_id = payment_transactions.escrow_payment_id and (public.current_user_is_member(o.household_id) or a.user_id = auth.uid())
));

revoke all on function public.consume_ai_request() from public;
grant execute on function public.consume_ai_request() to authenticated;

do $$
declare t text;
begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['shopping_requests','request_items','quotes'] loop
      if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;

revoke all on function public.create_household(text,text,text,integer) from public;
grant execute on function public.create_household(text,text,text,integer) to authenticated;
revoke all on function public.create_shopping_request(text,numeric,text,text,jsonb) from public;
grant execute on function public.create_shopping_request(text,numeric,text,text,jsonb) to authenticated;
revoke all on function public.submit_quote(uuid,jsonb,integer,text) from public;
grant execute on function public.submit_quote(uuid,jsonb,integer,text) to authenticated;
revoke all on function public.accept_quote(uuid) from public;
grant execute on function public.accept_quote(uuid) to authenticated;
