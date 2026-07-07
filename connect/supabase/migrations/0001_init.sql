-- KinLeague Connect — initial schema
-- Run in Supabase SQL Editor (or `supabase db push`) on a fresh project.
--
-- Admin access model: this migration does NOT grant the `admin` app-role
-- elevated access via RLS. Admin mutations (verify agent/brokerage, grant
-- credits, etc.) are performed server-side using SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS and column grants entirely. This is simpler and more
-- secure than threading an is_admin() check through every policy, and keeps
-- the service-role secret exactly where the env var layout already puts it
-- (server-only). Admin SELECT-only dashboards can use the same key
-- server-side.

-- =========================================================================
-- ENUMS
-- =========================================================================

create type user_role as enum ('agent', 'brokerage', 'admin');
create type agent_type as enum ('real_estate', 'mortgage');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type interest_direction as enum ('agent_to_brokerage', 'brokerage_to_agent');
create type interest_status as enum ('pending', 'accepted', 'declined', 'withdrawn');
create type match_stage as enum ('matched', 'intro_sent', 'interviewing', 'offer', 'placed', 'dead');
create type visa_offering as enum ('none', 'visa_only', 'visa_plus_basic');
create type lead_provision as enum ('no_leads', 'shared_pool', 'dedicated_leads');
create type billing_plan as enum ('free', 'credits', 'subscription');
create type credit_event as enum ('purchase', 'grant', 'reveal_spend', 'invite_spend', 'refund', 'expiry', 'adjustment');

-- =========================================================================
-- TABLES
-- =========================================================================

-- PROFILES (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  email text not null,
  phone_e164 text,                          -- WhatsApp handoff number
  avatar_url text,
  pdpl_consent_at timestamptz,              -- explicit consent timestamp (required)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AGENTS
create table public.agents (
  id uuid primary key references public.profiles(id) on delete cascade,
  agent_type agent_type not null default 'real_estate',
  headline text,
  years_experience int check (years_experience >= 0),
  rera_brn text,
  rera_card_url text,                       -- uploaded doc (private bucket)
  current_brokerage text,
  current_split text,
  languages text[] default '{}',
  areas text[] default '{}',
  specialties text[] default '{}',
  nationality text,
  visa_status text,
  min_split_pct int check (min_split_pct between 0 and 100),
  needs_leads boolean default false,
  needs_visa boolean default false,
  open_to_relocate boolean default false,
  bio text,
  verification verification_status default 'pending',
  verification_note text,                   -- admin note on reject
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BROKERAGES
create table public.brokerages (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id),
  name text not null,
  slug text unique not null,
  logo_url text,
  rera_orn text,
  trade_license_url text,                   -- uploaded doc (private bucket)
  emirate text not null default 'Dubai',
  office_location text,
  website text,
  team_size int,
  founded_year int,
  about text,
  hiring boolean default true,
  verification verification_status default 'pending',
  verification_note text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BROKERAGE TERMS (the transparency layer — one active row per brokerage)
create table public.brokerage_terms (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references public.brokerages(id) on delete cascade,
  commission_split text not null,
  split_structure text,
  visa visa_offering not null default 'visa_only',
  basic_salary_aed int,
  leads lead_provision not null default 'no_leads',
  leads_detail text,
  marketing_support text,
  portals_paid text[] default '{}',
  admin_support boolean default false,
  training_provided boolean default false,
  sim_and_laptop boolean default false,
  commission_payout_days int,
  notes text,
  is_current boolean default true,
  verified_by_admin boolean default false,  -- KinLeague checked these terms
  created_at timestamptz default now()
);

-- INTERESTS (one-directional expressions)
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  brokerage_id uuid not null references public.brokerages(id) on delete cascade,
  direction interest_direction not null,
  status interest_status not null default 'pending',
  message text,
  created_at timestamptz default now(),
  responded_at timestamptz,
  unique (agent_id, brokerage_id, direction)
);

-- MATCHES (created on mutual interest OR acceptance of a pending interest)
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id),
  brokerage_id uuid not null references public.brokerages(id),
  stage match_stage not null default 'matched',
  source_interest_id uuid references public.interests(id),
  whatsapp_handoff_at timestamptz,
  kinleague_owner text,
  placement_fee_expected_aed int,
  stage_notes text,
  revealed_at timestamptz,                  -- set by reveal_match_contact (step 8)
  revealed_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (agent_id, brokerage_id)
);

-- MATCH STAGE HISTORY (audit trail for pipeline)
create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  from_stage match_stage,
  to_stage match_stage not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz default now()
);

-- NOTIFICATIONS (simple in-app + email log)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb default '{}',
  read_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz default now()
);

-- BILLING (dormant in Phase A; enforced when MONETIZATION_MODE != 'free')
create table public.brokerage_billing (
  brokerage_id uuid primary key references public.brokerages(id) on delete cascade,
  plan billing_plan not null default 'free',
  credit_balance int not null default 0 check (credit_balance >= 0),
  subscription_active_until timestamptz,
  monthly_reveal_quota int,
  reveals_used_this_period int not null default 0,
  period_resets_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references public.brokerages(id) on delete cascade,
  event credit_event not null,
  amount int not null,
  balance_after int not null,
  related_match_id uuid references public.matches(id),
  related_interest_id uuid references public.interests(id),
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- =========================================================================
-- TRIGGERS
-- =========================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger t_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger t_agents_updated before update on public.agents for each row execute function public.set_updated_at();
create trigger t_brokerages_updated before update on public.brokerages for each row execute function public.set_updated_at();
create trigger t_matches_updated before update on public.matches for each row execute function public.set_updated_at();
create trigger t_billing_updated before update on public.brokerage_billing for each row execute function public.set_updated_at();

-- Every brokerage gets a billing row the moment it exists, so later steps
-- (credit grants, quota checks) never have to special-case a missing row.
create or replace function public.handle_new_brokerage()
returns trigger as $$
begin
  insert into public.brokerage_billing (brokerage_id, plan)
  values (new.id, 'free')
  on conflict (brokerage_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger t_brokerage_billing_init after insert on public.brokerages
  for each row execute function public.handle_new_brokerage();

-- =========================================================================
-- HELPER FUNCTIONS (used inside policies / directory views)
-- security definer + owned by the migration role, so they bypass RLS on
-- the tables they check — otherwise checking "is this brokerage verified"
-- from inside another table's policy would recurse into that table's own
-- RLS and see nothing.
-- =========================================================================

create or replace function public.owns_verified_brokerage()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.brokerages b
    where b.owner_profile_id = auth.uid() and b.verification = 'verified'
  );
$$;

create or replace function public.is_verified_agent()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.agents a
    where a.id = auth.uid() and a.verification = 'verified' and a.is_active = true
  );
$$;

-- Needed because "is brokerage X verified" has to be checkable for brokerages
-- the caller does NOT own — a plain correlated subquery against
-- public.brokerages inside another policy would itself be filtered by
-- brokerages' own owner-only RLS and always come back empty for anyone
-- who isn't the owner.
create or replace function public.brokerage_is_verified(bid uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.brokerages b
    where b.id = bid and b.verification = 'verified'
  );
$$;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.brokerages enable row level security;
alter table public.brokerage_terms enable row level security;
alter table public.interests enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.notifications enable row level security;
alter table public.brokerage_billing enable row level security;
alter table public.credit_ledger enable row level security;

-- ---- profiles: owner only. No cross-user read policy exists anywhere —
-- phone_e164/email leave this table only through a future SECURITY DEFINER
-- RPC (reveal_match_contact, step 8), never through a directly queryable
-- row policy. This is what makes "gated reveal" actually enforceable.
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- agents: owner only at the table level. Browsing by brokerages goes
-- through the agent_directory view below, which is the only place that
-- decides which columns a counterparty ever sees (never rera_card_url,
-- verification_note, or anything from profiles besides name/avatar).
create policy "agents_select_own" on public.agents
  for select using (id = auth.uid());
create policy "agents_insert_own" on public.agents
  for insert with check (
    id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent')
    and verification = 'pending'
    and verification_note is null
  );
create policy "agents_update_own" on public.agents
  for update using (id = auth.uid()) with check (id = auth.uid());

-- verification/verification_note are admin-set only. A column-level REVOKE
-- alone can't block them: Supabase's platform baseline already grants
-- table-wide UPDATE to `authenticated`, and a table-wide grant makes every
-- column updatable regardless of narrower per-column revokes layered on
-- top. So revoke the table-wide grant first, then re-grant UPDATE on just
-- the columns an agent should be able to touch.
revoke update on public.agents from authenticated;
grant update (
  agent_type, headline, years_experience, rera_brn, rera_card_url,
  current_brokerage, current_split, languages, areas, specialties,
  nationality, visa_status, min_split_pct, needs_leads, needs_visa,
  open_to_relocate, bio, is_active
) on public.agents to authenticated;

-- ---- brokerages: owner only at the table level, same reasoning as agents
-- (trade_license_url must never reach an agent). Browsing goes through
-- brokerage_directory below.
create policy "brokerages_select_own" on public.brokerages
  for select using (owner_profile_id = auth.uid());
create policy "brokerages_insert_own" on public.brokerages
  for insert with check (
    owner_profile_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'brokerage')
    and verification = 'pending'
    and verification_note is null
    and featured = false
  );
create policy "brokerages_update_own" on public.brokerages
  for update using (owner_profile_id = auth.uid()) with check (owner_profile_id = auth.uid());

-- Same table-wide-grant caveat as agents above.
revoke update on public.brokerages from authenticated;
grant update (
  name, logo_url, rera_orn, trade_license_url, emirate, office_location,
  website, team_size, founded_year, about, hiring
) on public.brokerages to authenticated;

-- ---- brokerage_terms: this IS the public transparency data — no private
-- columns, so (unlike agents/brokerages) verified agents read it directly
-- off the table rather than through a view.
create policy "terms_select" on public.brokerage_terms
  for select using (
    exists (select 1 from public.brokerages b where b.id = brokerage_terms.brokerage_id and b.owner_profile_id = auth.uid())
    or (public.is_verified_agent() and public.brokerage_is_verified(brokerage_terms.brokerage_id))
  );
create policy "terms_insert_own" on public.brokerage_terms
  for insert with check (
    exists (select 1 from public.brokerages b where b.id = brokerage_terms.brokerage_id and b.owner_profile_id = auth.uid())
    and verified_by_admin = false
  );
create policy "terms_update_own" on public.brokerage_terms
  for update using (
    exists (select 1 from public.brokerages b where b.id = brokerage_terms.brokerage_id and b.owner_profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.brokerages b where b.id = brokerage_terms.brokerage_id and b.owner_profile_id = auth.uid())
  );

-- Same table-wide-grant caveat as agents above.
revoke update on public.brokerage_terms from authenticated;
grant update (
  commission_split, split_structure, visa, basic_salary_aed, leads,
  leads_detail, marketing_support, portals_paid, admin_support,
  training_provided, sim_and_laptop, commission_payout_days, notes, is_current
) on public.brokerage_terms to authenticated;

-- ---- interests: each party reads/writes rows where they're a participant.
-- Agents can only ever create agent_to_brokerage rows for themselves;
-- brokerages can only create brokerage_to_agent rows for themselves —
-- neither side can speak for the other.
create policy "interests_select_participant" on public.interests
  for select using (
    agent_id = auth.uid()
    or exists (select 1 from public.brokerages b where b.id = interests.brokerage_id and b.owner_profile_id = auth.uid())
  );
create policy "interests_insert_agent" on public.interests
  for insert with check (direction = 'agent_to_brokerage' and agent_id = auth.uid());
create policy "interests_insert_brokerage" on public.interests
  for insert with check (
    direction = 'brokerage_to_agent'
    and exists (select 1 from public.brokerages b where b.id = interests.brokerage_id and b.owner_profile_id = auth.uid())
  );
create policy "interests_update_participant" on public.interests
  for update using (
    agent_id = auth.uid()
    or exists (select 1 from public.brokerages b where b.id = interests.brokerage_id and b.owner_profile_id = auth.uid())
  ) with check (
    agent_id = auth.uid()
    or exists (select 1 from public.brokerages b where b.id = interests.brokerage_id and b.owner_profile_id = auth.uid())
  );

-- ---- matches: participants read own. No insert/update policy for regular
-- users — rows are only ever written by the SECURITY DEFINER match-creation
-- function (step 7), which bypasses RLS by virtue of its own privileges.
create policy "matches_select_participant" on public.matches
  for select using (
    agent_id = auth.uid()
    or exists (select 1 from public.brokerages b where b.id = matches.brokerage_id and b.owner_profile_id = auth.uid())
  );

-- ---- match_events: audit trail, readable by the match's participants.
-- Written only by the (future) match-creation/stage-transition functions.
create policy "match_events_select_participant" on public.match_events
  for select using (
    exists (
      select 1 from public.matches m
      where m.id = match_events.match_id
        and (
          m.agent_id = auth.uid()
          or exists (select 1 from public.brokerages b where b.id = m.brokerage_id and b.owner_profile_id = auth.uid())
        )
    )
  );

-- ---- notifications: owner reads/marks own as read. Inserted only by
-- system-side functions/triggers, never directly by a client.
create policy "notifications_select_own" on public.notifications
  for select using (profile_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ---- brokerage_billing / credit_ledger: brokerage owner reads own,
-- never writes — every mutation goes through the (future) reveal RPC or
-- an admin server route using the service role key.
create policy "billing_select_own" on public.brokerage_billing
  for select using (
    exists (select 1 from public.brokerages b where b.id = brokerage_billing.brokerage_id and b.owner_profile_id = auth.uid())
  );
create policy "ledger_select_own" on public.credit_ledger
  for select using (
    exists (select 1 from public.brokerages b where b.id = credit_ledger.brokerage_id and b.owner_profile_id = auth.uid())
  );

-- =========================================================================
-- DIRECTORY VIEWS
-- Plain views (security_invoker defaults to false) run with the privileges
-- of their owner — the migration role — so they bypass the owner-only RLS
-- policies above by design. Each view hand-picks a safe column list and
-- encodes its own auth.uid()-based access check in the WHERE clause, which
-- is the only thing standing between a browsing user and this data, so
-- treat edits to these WHERE clauses as security-sensitive.
-- =========================================================================

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
  and public.owns_verified_brokerage();

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
  and public.is_verified_agent();

grant select on public.agent_directory to authenticated;
grant select on public.brokerage_directory to authenticated;

-- =========================================================================
-- STORAGE BUCKETS
-- =========================================================================

insert into storage.buckets (id, name, public)
values
  ('verification-docs', 'verification-docs', false),
  ('avatars', 'avatars', true),
  ('logos', 'logos', true)
on conflict (id) do nothing;

-- verification-docs: private, owner-only. Objects must be uploaded under a
-- `{auth.uid()}/...` path — that's what (storage.foldername(name))[1] checks.
create policy "verification_docs_insert_own" on storage.objects
  for insert with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "verification_docs_select_own" on storage.objects
  for select using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "verification_docs_update_own" on storage.objects
  for update using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "verification_docs_delete_own" on storage.objects
  for delete using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

-- avatars / logos: public read, owner-only write, same folder convention.
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_insert_own" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos_public_read" on storage.objects
  for select using (bucket_id = 'logos');
create policy "logos_insert_own" on storage.objects
  for insert with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos_update_own" on storage.objects
  for update using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos_delete_own" on storage.objects
  for delete using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
