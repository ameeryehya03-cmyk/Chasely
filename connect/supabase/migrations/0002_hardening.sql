-- KinLeague Connect — security hardening pass
-- Run AFTER 0001_init.sql. Addresses findings from the Supabase security
-- advisor after applying 0001 to a live project:
--
-- 1. set_updated_at had a mutable search_path — pin it.
-- 2. The four SECURITY DEFINER helper functions were reachable directly via
--    PostgREST RPC (/rest/v1/rpc/...) by anon/authenticated, since anything
--    in the `public` schema is auto-exposed. They're only meant to be used
--    from inside RLS policies/views, never called directly. Move them into
--    a `private` schema, which PostgREST doesn't expose, while keeping them
--    fully usable from policies (plain SQL, not routed through PostgREST).
-- 3. avatars/logos are public buckets — the storage API already serves
--    objects from them at a public URL without going through RLS at all.
--    The broad SELECT policies added on top of that in 0001 additionally
--    let anyone list/enumerate every object in the bucket via the data
--    API, which isn't needed for public-URL image display. Drop them.
--
-- (agent_directory/brokerage_directory are also flagged by the advisor as
-- "security definer view" — that's intentional: they're owned by the
-- migration role specifically so they can bypass the owner-only RLS on
-- agents/brokerages, with their own auth.uid()-scoped WHERE clause as the
-- real access check. Not touched here.)

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.owns_verified_brokerage()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.brokerages b
    where b.owner_profile_id = auth.uid() and b.verification = 'verified'
  );
$$;

create or replace function private.is_verified_agent()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.agents a
    where a.id = auth.uid() and a.verification = 'verified' and a.is_active = true
  );
$$;

create or replace function private.brokerage_is_verified(bid uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.brokerages b
    where b.id = bid and b.verification = 'verified'
  );
$$;

create or replace function private.handle_new_brokerage()
returns trigger as $$
begin
  insert into public.brokerage_billing (brokerage_id, plan)
  values (new.id, 'free')
  on conflict (brokerage_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function private.owns_verified_brokerage() to authenticated;
grant execute on function private.is_verified_agent() to authenticated;
grant execute on function private.brokerage_is_verified(uuid) to authenticated;

-- repoint the trigger
drop trigger t_brokerage_billing_init on public.brokerages;
create trigger t_brokerage_billing_init after insert on public.brokerages
  for each row execute function private.handle_new_brokerage();

-- repoint the policy that used the old public helper
drop policy "terms_select" on public.brokerage_terms;
create policy "terms_select" on public.brokerage_terms
  for select using (
    exists (select 1 from public.brokerages b where b.id = brokerage_terms.brokerage_id and b.owner_profile_id = auth.uid())
    or (private.is_verified_agent() and private.brokerage_is_verified(brokerage_terms.brokerage_id))
  );

-- repoint the directory views
drop view public.agent_directory;
create view public.agent_directory as
select
  a.id,
  p.full_name,
  p.avatar_url,
  a.agent_type,
  a.headline,
  a.years_experience,
  a.current_brokerage,
  a.current_split,
  a.languages,
  a.areas,
  a.specialties,
  a.nationality,
  a.visa_status,
  a.min_split_pct,
  a.needs_leads,
  a.needs_visa,
  a.open_to_relocate,
  a.bio,
  a.created_at
from public.agents a
join public.profiles p on p.id = a.id
where a.verification = 'verified'
  and a.is_active = true
  and private.owns_verified_brokerage();

drop view public.brokerage_directory;
create view public.brokerage_directory as
select
  b.id,
  b.name,
  b.slug,
  b.logo_url,
  b.emirate,
  b.office_location,
  b.website,
  b.team_size,
  b.founded_year,
  b.about,
  b.hiring,
  b.featured,
  b.created_at
from public.brokerages b
where b.verification = 'verified'
  and private.is_verified_agent();

grant select on public.agent_directory to authenticated;
grant select on public.brokerage_directory to authenticated;

-- old public-schema copies are no longer referenced anywhere; drop them
-- (this also removes their PostgREST RPC exposure)
drop function if exists public.owns_verified_brokerage();
drop function if exists public.is_verified_agent();
drop function if exists public.brokerage_is_verified(uuid);
drop function if exists public.handle_new_brokerage();

-- public buckets serve objects via a public URL without RLS involvement;
-- these policies only added unwanted listing/enumeration capability.
drop policy "avatars_public_read" on storage.objects;
drop policy "logos_public_read" on storage.objects;
