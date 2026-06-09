-- AgentSource: Dubai Real Estate Agent Sourcing Platform
-- Migration 001 — Full Schema
-- Run in Supabase SQL editor: Dashboard → SQL Editor → New query

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type outreach_status_enum as enum (
  'new', 'contacted', 'replied', 'meeting', 'won', 'dead'
);

create type connector_status_enum as enum (
  'running', 'completed', 'failed', 'cancelled'
);

create type duplicate_review_status_enum as enum (
  'pending', 'merged', 'dismissed'
);

-- ─── AGENTS ──────────────────────────────────────────────────────────────────

create table public.agents (
  id                    uuid default gen_random_uuid() primary key,
  full_name             text,
  agency_name           text,

  -- contact details
  phone                 text,
  email                 text,
  whatsapp              text,

  -- social / web
  instagram_handle      text,
  instagram_followers   integer,
  linkedin_url          text,
  website               text,

  -- RERA/DLD
  rera_brn              text unique,

  -- profile enrichment
  specialization_areas  text[] default '{}',
  languages             text[] default '{}',
  address               text,
  city                  text default 'Dubai',

  -- Google Places
  google_place_id       text unique,
  google_rating         numeric(3,1),
  google_review_count   integer,

  -- compliance / retention
  data_flagged_for_review boolean default false,
  flagged_at            timestamptz,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index on public.agents (rera_brn) where rera_brn is not null;
create index on public.agents (phone) where phone is not null;
create index on public.agents (email) where email is not null;
create index on public.agents (google_place_id) where google_place_id is not null;
create index on public.agents using gin (specialization_areas);
create index on public.agents (agency_name);
create index on public.agents (full_name);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agents_updated_at
  before update on public.agents
  for each row execute function public.set_updated_at();

-- ─── CONTACT PROVENANCE ───────────────────────────────────────────────────────
-- One row per (agent, field) recording which source/provider provided the value.

create table public.contact_provenance (
  id              uuid default gen_random_uuid() primary key,
  agent_id        uuid not null references public.agents(id) on delete cascade,
  field_name      text not null,  -- 'phone', 'email', 'whatsapp', etc.
  source_name     text not null,  -- 'google', 'dld', 'manual', 'enrichment', etc.
  provider_name   text,           -- enrichment provider name if applicable
  legal_basis     text not null,  -- 'google_places_api_tos', 'public_register', 'licensed_b2b_data', 'manual_entry', etc.
  captured_at     timestamptz default now(),
  notes           text
);

create index on public.contact_provenance (agent_id);
create index on public.contact_provenance (agent_id, field_name);

-- ─── SOURCES (per-agent source links) ────────────────────────────────────────

create table public.agent_sources (
  id              uuid default gen_random_uuid() primary key,
  agent_id        uuid not null references public.agents(id) on delete cascade,
  source_name     text not null,  -- connector name
  external_id     text,           -- ID in that source system
  source_url      text,
  raw_record_id   uuid,
  captured_at     timestamptz default now(),
  unique (agent_id, source_name)
);

create index on public.agent_sources (agent_id);

-- ─── RAW RECORDS (audit log of every connector payload) ──────────────────────

create table public.raw_records (
  id            uuid default gen_random_uuid() primary key,
  connector     text not null,
  external_id   text,
  payload       jsonb not null,
  captured_at   timestamptz default now()
);

create index on public.raw_records (connector, external_id);

-- ─── CONSENT & OUTREACH ───────────────────────────────────────────────────────

create table public.consent_and_outreach (
  id                  uuid default gen_random_uuid() primary key,
  agent_id            uuid not null unique references public.agents(id) on delete cascade,
  outreach_status     outreach_status_enum not null default 'new',
  consent_basis       text,
  opt_out             boolean not null default false,
  opt_out_at          timestamptz,
  last_contacted_at   timestamptz,
  notes               text,
  updated_at          timestamptz default now()
);

create trigger consent_updated_at
  before update on public.consent_and_outreach
  for each row execute function public.set_updated_at();

-- ─── SUPPRESSION LIST ────────────────────────────────────────────────────────
-- Anyone on this list is excluded from all exports and outreach.

create table public.suppression_list (
  id          uuid default gen_random_uuid() primary key,
  agent_id    uuid references public.agents(id) on delete set null,
  email       text,
  phone       text,
  reason      text,
  added_at    timestamptz default now(),
  added_by    text default 'user'
);

create index on public.suppression_list (agent_id) where agent_id is not null;
create index on public.suppression_list (email) where email is not null;
create index on public.suppression_list (phone) where phone is not null;

-- ─── CONNECTOR RUNS ──────────────────────────────────────────────────────────

create table public.connector_runs (
  id                uuid default gen_random_uuid() primary key,
  connector         text not null,
  started_at        timestamptz default now(),
  completed_at      timestamptz,
  status            connector_status_enum not null default 'running',
  records_added     integer default 0,
  records_updated   integer default 0,
  records_skipped   integer default 0,
  records_failed    integer default 0,
  error_message     text,
  params            jsonb
);

create index on public.connector_runs (connector, started_at desc);

-- ─── DEDUP / POSSIBLE DUPLICATES ─────────────────────────────────────────────

create table public.possible_duplicates (
  id                uuid default gen_random_uuid() primary key,
  agent_id_a        uuid not null references public.agents(id) on delete cascade,
  agent_id_b        uuid not null references public.agents(id) on delete cascade,
  similarity_score  numeric(4,3),
  match_reason      text,   -- 'phone', 'email', 'name+agency', 'instagram', etc.
  status            duplicate_review_status_enum not null default 'pending',
  created_at        timestamptz default now(),
  reviewed_at       timestamptz,
  unique (agent_id_a, agent_id_b)
);

create index on public.possible_duplicates (status);

-- ─── MESSAGE TEMPLATES ───────────────────────────────────────────────────────

create table public.message_templates (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  channel       text not null,   -- 'email', 'whatsapp', 'sms'
  subject       text,
  body          text not null,
  -- body must include {{opt_out_line}} placeholder — enforced by app layer
  has_opt_out   boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── RLS — service role only (single-user internal tool) ─────────────────────
-- All tables: public access disabled; service_role key (backend) has full access.

alter table public.agents                enable row level security;
alter table public.contact_provenance    enable row level security;
alter table public.agent_sources         enable row level security;
alter table public.raw_records           enable row level security;
alter table public.consent_and_outreach  enable row level security;
alter table public.suppression_list      enable row level security;
alter table public.connector_runs        enable row level security;
alter table public.possible_duplicates   enable row level security;
alter table public.message_templates     enable row level security;

-- Deny all for anon/authenticated roles; service_role bypasses RLS by default.
create policy "deny_all_agents"               on public.agents               for all using (false);
create policy "deny_all_contact_provenance"   on public.contact_provenance   for all using (false);
create policy "deny_all_agent_sources"        on public.agent_sources        for all using (false);
create policy "deny_all_raw_records"          on public.raw_records          for all using (false);
create policy "deny_all_consent"              on public.consent_and_outreach for all using (false);
create policy "deny_all_suppression"          on public.suppression_list     for all using (false);
create policy "deny_all_runs"                 on public.connector_runs       for all using (false);
create policy "deny_all_duplicates"           on public.possible_duplicates  for all using (false);
create policy "deny_all_templates"            on public.message_templates    for all using (false);

-- ─── RETENTION HELPER VIEW ───────────────────────────────────────────────────
-- Flags agents not touched in 12 months for review.

create or replace view public.stale_agents as
  select a.id, a.full_name, a.agency_name, a.updated_at,
         now() - a.updated_at as age
  from public.agents a
  where a.updated_at < now() - interval '12 months'
    and a.data_flagged_for_review = false;

-- ─── USEFUL VIEW: agents with outreach status & suppression flag ──────────────

create or replace view public.agents_enriched as
  select
    a.*,
    coalesce(co.outreach_status, 'new') as outreach_status,
    co.opt_out,
    co.last_contacted_at,
    co.notes as outreach_notes,
    (sl.id is not null) as on_suppression_list
  from public.agents a
  left join public.consent_and_outreach co on co.agent_id = a.id
  left join public.suppression_list sl     on sl.agent_id = a.id;
