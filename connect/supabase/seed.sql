-- KinLeague Connect — dev seed data
-- Run AFTER 0001_init.sql. Creates 10 verified brokerages (with terms) and
-- 20 verified agents so the browse/candidates directories have something
-- to show in dev.
--
-- Seeded users get a real auth.users row (password: kinleague-dev) so the
-- profiles/agents/brokerages FKs are satisfiable, but no auth.identities
-- row is created — GoTrue's identity linking is version-sensitive and not
-- needed just to populate directories. If you need to actually log in as
-- a seeded user for QA, do it via Supabase Studio ("reset password") or
-- the Admin API rather than the app's password-login form.
--
-- Safe to re-run: every insert is keyed on a fixed id/email/slug with
-- ON CONFLICT DO NOTHING.

-- =========================================================================
-- AUTH USERS
-- =========================================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  v.id,
  'authenticated',
  'authenticated',
  v.email,
  crypt('kinleague-dev', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'agent01@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'agent02@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'agent03@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'agent04@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000005'::uuid, 'agent05@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000006'::uuid, 'agent06@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000007'::uuid, 'agent07@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000008'::uuid, 'agent08@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000009'::uuid, 'agent09@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000010'::uuid, 'agent10@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000011'::uuid, 'agent11@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000012'::uuid, 'agent12@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000013'::uuid, 'agent13@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000014'::uuid, 'agent14@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000015'::uuid, 'agent15@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000016'::uuid, 'agent16@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000017'::uuid, 'agent17@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000018'::uuid, 'agent18@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000019'::uuid, 'agent19@seed.kinleague.dev'),
  ('a0000000-0000-4000-8000-000000000020'::uuid, 'agent20@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000001'::uuid, 'brokerage01@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000002'::uuid, 'brokerage02@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, 'brokerage03@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000004'::uuid, 'brokerage04@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000005'::uuid, 'brokerage05@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000006'::uuid, 'brokerage06@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000007'::uuid, 'brokerage07@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000008'::uuid, 'brokerage08@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000009'::uuid, 'brokerage09@seed.kinleague.dev'),
  ('b0000000-0000-4000-8000-000000000010'::uuid, 'brokerage10@seed.kinleague.dev')
) as v(id, email)
on conflict (id) do nothing;

-- =========================================================================
-- PROFILES
-- =========================================================================

insert into public.profiles (id, role, full_name, email, phone_e164, pdpl_consent_at)
values
  ('a0000000-0000-4000-8000-000000000001', 'agent', 'Fatima Al Mansoori', 'agent01@seed.kinleague.dev', '+971501234501', now()),
  ('a0000000-0000-4000-8000-000000000002', 'agent', 'Youssef Haddad',     'agent02@seed.kinleague.dev', '+971501234502', now()),
  ('a0000000-0000-4000-8000-000000000003', 'agent', 'Elena Petrova',      'agent03@seed.kinleague.dev', '+971501234503', now()),
  ('a0000000-0000-4000-8000-000000000004', 'agent', 'Rahul Mehta',        'agent04@seed.kinleague.dev', '+971501234504', now()),
  ('a0000000-0000-4000-8000-000000000005', 'agent', 'Sara Khalil',        'agent05@seed.kinleague.dev', '+971501234505', now()),
  ('a0000000-0000-4000-8000-000000000006', 'agent', 'Omar Idris',         'agent06@seed.kinleague.dev', '+971501234506', now()),
  ('a0000000-0000-4000-8000-000000000007', 'agent', 'Natasha Volkov',     'agent07@seed.kinleague.dev', '+971501234507', now()),
  ('a0000000-0000-4000-8000-000000000008', 'agent', 'Aisha Rahman',       'agent08@seed.kinleague.dev', '+971501234508', now()),
  ('a0000000-0000-4000-8000-000000000009', 'agent', 'Dmitri Sokolov',     'agent09@seed.kinleague.dev', '+971501234509', now()),
  ('a0000000-0000-4000-8000-000000000010', 'agent', 'Layla Haidar',       'agent10@seed.kinleague.dev', '+971501234510', now()),
  ('a0000000-0000-4000-8000-000000000011', 'agent', 'Karan Sharma',       'agent11@seed.kinleague.dev', '+971501234511', now()),
  ('a0000000-0000-4000-8000-000000000012', 'agent', 'Noor Abdallah',      'agent12@seed.kinleague.dev', '+971501234512', now()),
  ('a0000000-0000-4000-8000-000000000013', 'agent', 'Ivan Petrenko',      'agent13@seed.kinleague.dev', '+971501234513', now()),
  ('a0000000-0000-4000-8000-000000000014', 'agent', 'Mariam El Sayed',    'agent14@seed.kinleague.dev', '+971501234514', now()),
  ('a0000000-0000-4000-8000-000000000015', 'agent', 'Ahmed Zaki',         'agent15@seed.kinleague.dev', '+971501234515', now()),
  ('a0000000-0000-4000-8000-000000000016', 'agent', 'Olga Kuznetsova',    'agent16@seed.kinleague.dev', '+971501234516', now()),
  ('a0000000-0000-4000-8000-000000000017', 'agent', 'Hassan Farouk',      'agent17@seed.kinleague.dev', '+971501234517', now()),
  ('a0000000-0000-4000-8000-000000000018', 'agent', 'Priya Nair',         'agent18@seed.kinleague.dev', '+971501234518', now()),
  ('a0000000-0000-4000-8000-000000000019', 'agent', 'Ali Al Suwaidi',     'agent19@seed.kinleague.dev', '+971501234519', now()),
  ('a0000000-0000-4000-8000-000000000020', 'agent', 'Ekaterina Ivanova',  'agent20@seed.kinleague.dev', '+971501234520', now()),
  ('b0000000-0000-4000-8000-000000000001', 'brokerage', 'Marina Prime Owner',    'brokerage01@seed.kinleague.dev', '+971502234501', now()),
  ('b0000000-0000-4000-8000-000000000002', 'brokerage', 'Downtown Estates Owner','brokerage02@seed.kinleague.dev', '+971502234502', now()),
  ('b0000000-0000-4000-8000-000000000003', 'brokerage', 'JVC Realty Owner',      'brokerage03@seed.kinleague.dev', '+971502234503', now()),
  ('b0000000-0000-4000-8000-000000000004', 'brokerage', 'Palm Realty Owner',     'brokerage04@seed.kinleague.dev', '+971502234504', now()),
  ('b0000000-0000-4000-8000-000000000005', 'brokerage', 'Hills Homes Owner',     'brokerage05@seed.kinleague.dev', '+971502234505', now()),
  ('b0000000-0000-4000-8000-000000000006', 'brokerage', 'Bay Square Owner',      'brokerage06@seed.kinleague.dev', '+971502234506', now()),
  ('b0000000-0000-4000-8000-000000000007', 'brokerage', 'Ranches Realty Owner',  'brokerage07@seed.kinleague.dev', '+971502234507', now()),
  ('b0000000-0000-4000-8000-000000000008', 'brokerage', 'Creek Harbour Owner',   'brokerage08@seed.kinleague.dev', '+971502234508', now()),
  ('b0000000-0000-4000-8000-000000000009', 'brokerage', 'Abu Dhabi Homes Owner', 'brokerage09@seed.kinleague.dev', '+971502234509', now()),
  ('b0000000-0000-4000-8000-000000000010', 'brokerage', 'RAK Coastal Owner',     'brokerage10@seed.kinleague.dev', '+971502234510', now())
on conflict (id) do nothing;

-- =========================================================================
-- AGENTS
-- =========================================================================

insert into public.agents (
  id, agent_type, headline, years_experience, current_brokerage, current_split,
  languages, areas, specialties, nationality, visa_status, min_split_pct,
  needs_leads, needs_visa, open_to_relocate, bio, verification, is_active
) values
  ('a0000000-0000-4000-8000-000000000001', 'real_estate', 'Off-plan specialist, Business Bay', 6, 'Self-employed', '60/40', '{English,Arabic}', '{Business Bay,Downtown Dubai}', '{off_plan}', 'Emirati', 'own_visa', 60, true, false, false, 'Six years closing off-plan deals in Business Bay and Downtown.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000002', 'real_estate', 'Secondary sales, Dubai Marina', 4, 'Marina Prime', '50/50', '{English,Arabic,French}', '{Dubai Marina,JBR}', '{secondary,leasing}', 'Lebanese', 'own_visa', 55, false, false, false, 'Marina and JBR resale specialist with a strong landlord network.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000003', 'real_estate', 'Luxury off-plan, Palm Jumeirah', 8, 'Self-employed', '70/30', '{English,Russian}', '{Palm Jumeirah,Dubai Marina}', '{luxury,off_plan}', 'Russian', 'own_visa', 65, false, false, false, 'High-net-worth off-plan sales on the Palm and Marina.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000004', 'real_estate', 'Investor sales, JVC', 3, 'JVC Realty', '50/50', '{English,Hindi}', '{JVC,JVT}', '{off_plan,secondary}', 'Indian', 'needs_visa', 50, true, true, true, 'Focused on first-time investors in JVC and JVT.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000005', 'real_estate', 'Leasing lead, Downtown Dubai', 5, 'Downtown Estates', '55/45', '{English,Arabic}', '{Downtown Dubai,Business Bay}', '{leasing,secondary}', 'Jordanian', 'own_visa', 50, true, false, false, 'High-volume leasing across Downtown towers.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000006', 'real_estate', 'Off-plan, Dubai Hills', 7, 'Hills Homes', '60/40', '{English,Arabic}', '{Dubai Hills,Arabian Ranches}', '{off_plan,luxury}', 'Sudanese', 'own_visa', 55, false, false, true, 'Villa communities specialist in Dubai Hills Estate.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000007', 'real_estate', 'Secondary villas, Arabian Ranches', 9, 'Ranches Realty', '65/35', '{English,Russian}', '{Arabian Ranches,Dubai Hills}', '{secondary,luxury}', 'Russian', 'own_visa', 60, false, false, false, 'Nine years selling family villas in Arabian Ranches.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000008', 'real_estate', 'Off-plan, Business Bay', 2, 'Self-employed', 'freelance', '{English,Arabic,Urdu}', '{Business Bay,Downtown Dubai}', '{off_plan}', 'Pakistani', 'freelance_permit', 55, true, true, false, 'New to the market, hungry for shared-pool leads.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000009', 'real_estate', 'Luxury leasing, Palm Jumeirah', 6, 'Palm Realty', '60/40', '{English,Russian}', '{Palm Jumeirah}', '{luxury,leasing}', 'Russian', 'own_visa', 55, false, false, false, 'Ultra-luxury villa leasing on the Palm.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000010', 'real_estate', 'Secondary sales, Business Bay', 4, 'Bay Square', '50/50', '{English,Arabic}', '{Business Bay,Downtown Dubai}', '{secondary}', 'Lebanese', 'own_visa', 50, true, false, false, 'Bay Square and Executive Towers resale specialist.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000011', 'real_estate', 'Off-plan investor sales, JVC', 5, 'JVC Realty', '55/45', '{English,Hindi,Arabic}', '{JVC,JVT}', '{off_plan}', 'Indian', 'own_visa', 50, true, false, true, 'Cross-border investor sales, mostly India and GCC.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000012', 'real_estate', 'Leasing, Dubai Marina', 3, 'Marina Prime', '50/50', '{English,Arabic}', '{Dubai Marina,JBR}', '{leasing}', 'Jordanian', 'needs_visa', 50, true, true, false, 'Fast-turnaround leasing across Marina towers.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000013', 'real_estate', 'Commercial leasing, Business Bay', 10, 'Self-employed', '70/30', '{English,Russian}', '{Business Bay,Downtown Dubai}', '{commercial}', 'Ukrainian', 'own_visa', 65, false, false, false, 'Decade in commercial leasing for Business Bay towers.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000014', 'real_estate', 'Off-plan sales, Creek Harbour', 4, 'Creek Harbour Realty', '55/45', '{English,Arabic}', '{Downtown Dubai,Business Bay}', '{off_plan}', 'Egyptian', 'own_visa', 50, true, false, false, 'Early off-plan launches in Dubai Creek Harbour.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000015', 'real_estate', 'Secondary sales, Downtown Dubai', 6, 'Downtown Estates', '60/40', '{English,Arabic}', '{Downtown Dubai}', '{secondary,luxury}', 'Emirati', 'own_visa', 55, false, false, false, 'Boulevard and Opera District resale specialist.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000016', 'real_estate', 'Off-plan, Dubai Marina', 2, 'Self-employed', 'freelance', '{English,Russian}', '{Dubai Marina,JBR}', '{off_plan}', 'Russian', 'freelance_permit', 55, true, true, false, 'Building a book of Russian-speaking off-plan buyers.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000017', 'real_estate', 'Villas, Arabian Ranches', 7, 'Ranches Realty', '60/40', '{English,Arabic}', '{Arabian Ranches,Dubai Hills}', '{secondary}', 'Egyptian', 'own_visa', 55, false, false, true, 'Villa resale and upgrades within Ranches communities.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000018', 'real_estate', 'Off-plan investor sales, JVT', 3, 'JVC Realty', '50/50', '{English,Hindi}', '{JVT,JVC}', '{off_plan,secondary}', 'Indian', 'needs_visa', 50, true, true, true, 'Focused on GCC and South Asian investor clients.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000019', 'real_estate', 'Luxury sales, Palm Jumeirah', 11, 'Palm Realty', '70/30', '{English,Arabic,Russian}', '{Palm Jumeirah,Dubai Marina}', '{luxury}', 'Emirati', 'own_visa', 65, false, false, false, 'Eleven years in ultra-luxury Palm villa sales.', 'verified', true),
  ('a0000000-0000-4000-8000-000000000020', 'real_estate', 'Off-plan, Abu Dhabi', 5, 'Abu Dhabi Homes', '55/45', '{English,Arabic,Russian}', '{Business Bay,Downtown Dubai}', '{off_plan}', 'Russian', 'own_visa', 50, true, false, true, 'Dubai-based, open to relocating for the right Abu Dhabi split.', 'verified', true)
on conflict (id) do nothing;

-- =========================================================================
-- BROKERAGES
-- =========================================================================

insert into public.brokerages (
  id, owner_profile_id, name, slug, emirate, office_location, website,
  team_size, founded_year, about, hiring, verification
) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Marina Prime Properties', 'marina-prime-properties', 'Dubai', 'Marina Plaza, Dubai Marina', 'https://marinaprime.example.com', 45, 2015, 'Marina and JBR specialists with an in-house marketing team.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Downtown Estates', 'downtown-estates', 'Dubai', 'Boulevard Plaza, Downtown Dubai', 'https://downtownestates.example.com', 60, 2012, 'Downtown and Business Bay resale and leasing brokerage.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'JVC Realty Group', 'jvc-realty-group', 'Dubai', 'Circle Mall, JVC', 'https://jvcrealty.example.com', 30, 2018, 'High-volume off-plan brokerage focused on JVC and JVT.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'Palm Realty', 'palm-realty', 'Dubai', 'Golden Mile, Palm Jumeirah', 'https://palmrealty.example.com', 20, 2010, 'Ultra-luxury Palm Jumeirah sales and leasing.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'Hills Homes', 'hills-homes', 'Dubai', 'Dubai Hills Business Park', 'https://hillshomes.example.com', 25, 2019, 'Dubai Hills Estate villa and townhouse specialists.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'Bay Square Realty', 'bay-square-realty', 'Dubai', 'Bay Square, Business Bay', 'https://baysquarerealty.example.com', 18, 2016, 'Boutique Business Bay resale brokerage.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000007', 'Ranches Realty', 'ranches-realty', 'Dubai', 'Arabian Ranches Retail Centre', 'https://ranchesrealty.example.com', 22, 2013, 'Villa community specialists across Arabian Ranches.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000008', 'Creek Harbour Realty', 'creek-harbour-realty', 'Dubai', 'Dubai Creek Harbour Sales Centre', 'https://creekharbourrealty.example.com', 15, 2021, 'Early-access off-plan sales in Dubai Creek Harbour.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000009', 'Abu Dhabi Homes', 'abu-dhabi-homes', 'Abu Dhabi', 'Al Reem Island', 'https://abudhabihomes.example.com', 35, 2011, 'Abu Dhabi-wide brokerage with a Dubai referral desk.', true, 'verified'),
  ('c0000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000010', 'RAK Coastal Properties', 'rak-coastal-properties', 'Ras Al Khaimah', 'Al Marjan Island', 'https://rakcoastal.example.com', 12, 2020, 'Waterfront developments across Ras Al Khaimah.', true, 'verified')
on conflict (id) do nothing;

-- =========================================================================
-- BROKERAGE TERMS
-- =========================================================================

-- brokerage_terms has no unique constraint to key an ON CONFLICT off, so
-- re-running this seed is guarded with NOT EXISTS instead.
insert into public.brokerage_terms (
  brokerage_id, commission_split, visa, basic_salary_aed, leads, leads_detail,
  marketing_support, portals_paid, admin_support, training_provided,
  sim_and_laptop, commission_payout_days, is_current, verified_by_admin
)
select v.brokerage_id, v.commission_split, v.visa, v.basic_salary_aed, v.leads, v.leads_detail,
  v.marketing_support, v.portals_paid, v.admin_support, v.training_provided,
  v.sim_and_laptop, v.commission_payout_days, true, true
from (values
  ('c0000000-0000-4000-8000-000000000001'::uuid, '60/40', 'visa_only'::visa_offering, null::int, 'shared_pool'::lead_provision, '25 Property Finder leads/month shared', 'Bayut + PF listings paid, in-house photographer', '{Bayut,"Property Finder"}'::text[], true, true, true, 30),
  ('c0000000-0000-4000-8000-000000000002', '65/35', 'visa_plus_basic', 4000, 'dedicated_leads', '15 dedicated leads/month per agent', 'Full portal coverage + videographer', '{Bayut,"Property Finder",Dubizzle}', true, true, true, 21),
  ('c0000000-0000-4000-8000-000000000003', '50/50', 'visa_only', null, 'shared_pool', 'Shared developer leads, ~30/month across team', 'Bayut listings paid', '{Bayut}', false, true, false, 45),
  ('c0000000-0000-4000-8000-000000000004', '70/30', 'none', null, 'no_leads', null, 'Premium portal placement for listings only', '{"Property Finder"}', true, false, false, 30),
  ('c0000000-0000-4000-8000-000000000005', '60/40', 'visa_only', null, 'dedicated_leads', '10 dedicated leads/month, Dubai Hills only', 'Bayut + PF listings paid', '{Bayut,"Property Finder"}', true, true, true, 30),
  ('c0000000-0000-4000-8000-000000000006', 'tiered 50-65', 'visa_only', null, 'shared_pool', 'Shared pool, tiers up with volume', 'Bayut listings paid', '{Bayut}', false, false, false, 30),
  ('c0000000-0000-4000-8000-000000000007', '65/35', 'visa_plus_basic', 5000, 'dedicated_leads', '12 dedicated leads/month per agent', 'Full portal coverage + drone photography', '{Bayut,"Property Finder",Dubizzle}', true, true, true, 21),
  ('c0000000-0000-4000-8000-000000000008', '55/45', 'visa_only', null, 'shared_pool', 'Developer-fed leads, shared pool', 'Bayut + PF listings paid', '{Bayut,"Property Finder"}', true, true, false, 30),
  ('c0000000-0000-4000-8000-000000000009', '60/40', 'visa_plus_basic', 4500, 'dedicated_leads', '20 dedicated leads/month per agent', 'Full portal coverage', '{Bayut,"Property Finder",Dubizzle}', true, true, true, 30),
  ('c0000000-0000-4000-8000-000000000010', '65/35', 'visa_only', null, 'shared_pool', 'Waterfront project leads, shared pool', 'Bayut + PF listings paid', '{Bayut,"Property Finder"}', false, true, false, 30)
) as v(brokerage_id, commission_split, visa, basic_salary_aed, leads, leads_detail, marketing_support, portals_paid, admin_support, training_provided, sim_and_laptop, commission_payout_days)
where not exists (
  select 1 from public.brokerage_terms t where t.brokerage_id = v.brokerage_id
);
