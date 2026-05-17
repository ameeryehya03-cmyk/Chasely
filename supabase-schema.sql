-- Run this in your Supabase SQL editor (supabase.com → your project → SQL editor)

create table public.leads (
  id          uuid default gen_random_uuid() primary key,
  first_name  text not null,
  last_name   text,
  email       text not null unique,
  phone       text,
  role        text not null,
  company     text,
  source      text default 'chasely_web',
  created_at  timestamptz default now()
);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Only your service key (backend) can read/write — no public access
create policy "service_only" on public.leads
  for all
  using (false);
