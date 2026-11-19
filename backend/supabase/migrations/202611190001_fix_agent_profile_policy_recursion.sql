create or replace function public.household_can_read_agent_profile(p_agent_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.quotes q
    join public.shopping_requests r on r.request_id = q.request_id
    where q.agent_id = p_agent_id
      and public.current_user_is_member(r.household_id)
  )
$$;

revoke all on function public.household_can_read_agent_profile(uuid) from public;
grant execute on function public.household_can_read_agent_profile(uuid) to authenticated;

drop policy if exists "Households read agent identity for quotes"
  on public.agent_profiles;

create policy "Households read agent identity for quotes"
  on public.agent_profiles for select using (
    verification_status = 'verified'
    and public.household_can_read_agent_profile(agent_id)
  );
