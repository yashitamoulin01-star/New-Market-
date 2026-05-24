-- ================================================================
-- newmarket.co.in — Jobs Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status enum
--       and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────
DO $$ BEGIN
  create type job_type as enum (
    'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'SEASONAL'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type job_category as enum (
    'RETAIL', 'FOOD_BEVERAGE', 'TAILORING', 'ELECTRONICS',
    'BEAUTY_WELLNESS', 'LOGISTICS_DELIVERY', 'MANAGEMENT',
    'SECURITY', 'HOUSEKEEPING', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type application_mode as enum (
    'WALK_IN', 'PHONE', 'EMAIL', 'ONLINE'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── Table ─────────────────────────────────────────────────────────
create table if not exists job_listings (
  id               uuid primary key default uuid_generate_v4(),

  -- Job details
  title            varchar(150) not null,
  description      text not null,
  requirements     text,
  benefits         text,

  -- Classification
  job_type         job_type not null,
  category         job_category not null,

  -- Employer
  shop_name        varchar(150) not null,
  shop_address     varchar(300),

  -- Compensation
  salary_min       integer,          -- monthly INR
  salary_max       integer,          -- monthly INR
  salary_label     varchar(100),     -- override e.g. "Negotiable"

  -- Application
  application_mode application_mode not null,
  application_link text,
  contact_name     varchar(100) not null,
  contact_email    varchar(255) not null,
  contact_phone    varchar(15),

  -- Details
  openings         integer not null default 1,
  experience_years integer,
  timing           varchar(100),     -- e.g. "10am – 8pm"

  -- Moderation
  status           content_status not null default 'PENDING',
  rejection_note   text,
  reviewed_at      timestamptz,

  -- Visibility
  is_featured      boolean not null default false,
  expires_at       timestamptz,
  view_count       integer not null default 0,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────
create index if not exists idx_jobs_status on job_listings(status);
create index if not exists idx_jobs_category on job_listings(category);
create index if not exists idx_jobs_type on job_listings(job_type);
create index if not exists idx_jobs_expires_at on job_listings(expires_at);

-- ── Updated-at trigger ────────────────────────────────────────────
drop trigger if exists job_listings_updated_at on job_listings;
create trigger job_listings_updated_at before update on job_listings
  for each row execute function update_updated_at_column();

-- ── View-count RPC ────────────────────────────────────────────────
create or replace function increment_job_view(job_id uuid)
returns void as $$
  update job_listings
  set view_count = view_count + 1
  where id = job_id and status = 'APPROVED';
$$ language sql security definer;

-- ── Grants ────────────────────────────────────────────────────────
grant select        on job_listings to anon;
grant insert        on job_listings to anon;
grant select, insert, update, delete on job_listings to authenticated;
grant execute on function increment_job_view to anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────
alter table job_listings enable row level security;

-- Public sees only approved, non-expired listings
drop policy if exists "anon_select_approved_active" on job_listings;
create policy "anon_select_approved_active" on job_listings for select to anon
  using (
    status = 'APPROVED'
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "anon_insert_pending" on job_listings;
create policy "anon_insert_pending" on job_listings for insert to anon
  with check (status = 'PENDING');

drop policy if exists "admin_full_access" on job_listings;
create policy "admin_full_access" on job_listings for all to authenticated
  using (true) with check (true);
