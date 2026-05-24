-- migration-001-news-enhancements.sql
-- Run in Supabase SQL Editor. Adds editorial control columns to news_articles.

ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_breaking         boolean   NOT NULL DEFAULT false;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_pinned           boolean   NOT NULL DEFAULT false;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_trending         boolean   NOT NULL DEFAULT false;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS priority_rank       integer   NOT NULL DEFAULT 100;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS homepage_slot       text
  CHECK (homepage_slot IN ('headline', 'ticker', 'sidebar', 'featured'));

CREATE INDEX IF NOT EXISTS idx_news_breaking ON news_articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX IF NOT EXISTS idx_news_pinned   ON news_articles(is_pinned)   WHERE is_pinned   = true;
CREATE INDEX IF NOT EXISTS idx_news_trending ON news_articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_news_rank     ON news_articles(priority_rank, published_at DESC) WHERE status = 'APPROVED';
CREATE INDEX IF NOT EXISTS idx_news_slot     ON news_articles(homepage_slot) WHERE homepage_slot IS NOT NULL;
-- migration-002-ads-system.sql
-- Run in Supabase SQL Editor. Creates the advertisements management system.

CREATE TABLE IF NOT EXISTS advertisements (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  title       varchar(200) NOT NULL,
  image_url   text    NOT NULL,
  link_url    text,
  slot        text    NOT NULL CHECK (slot IN (
    'homepage-top', 'homepage-mid-1', 'homepage-mid-2', 'homepage-bottom',
    'news-inline', 'sidebar', 'strip', 'article-top'
  )),
  is_active   boolean NOT NULL DEFAULT true,
  priority    integer NOT NULL DEFAULT 10,
  starts_at   timestamptz,
  ends_at     timestamptz,
  click_count integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_slot_active
  ON advertisements(slot, is_active, priority DESC);

-- RPC to safely increment click count
CREATE OR REPLACE FUNCTION increment_ad_click(ad_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE advertisements SET click_count = click_count + 1 WHERE id = ad_id;
$$;
GRANT EXECUTE ON FUNCTION increment_ad_click(uuid) TO anon, authenticated;

-- Row Level Security
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ads_public_read" ON advertisements
  FOR SELECT TO anon
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at   IS NULL OR ends_at   >= now())
  );

CREATE POLICY "ads_admin_all" ON advertisements
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT ON advertisements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON advertisements TO authenticated;
-- migration-003-elections.sql
-- Run in Supabase SQL Editor. Full election CMS tables.

DO $$ BEGIN
  CREATE TYPE election_phase AS ENUM (
    'DRAFT',
    'NOMINATIONS_OPEN',
    'VOTING_OPEN',
    'CLOSED',
    'RESULTS_PUBLISHED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS elections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             varchar(200) NOT NULL,
  title_hi          varchar(200),
  description       text,
  organization      varchar(200) NOT NULL DEFAULT 'New Market Vyapari Mahasangh',
  phase             election_phase NOT NULL DEFAULT 'DRAFT',
  nomination_starts timestamptz,
  nomination_ends   timestamptz,
  voting_starts     timestamptz,
  voting_ends       timestamptz,
  results_at        timestamptz,
  announcement      text,
  announcement_hi   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_positions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  title       varchar(150) NOT NULL,
  title_hi    varchar(150),
  seats       integer NOT NULL DEFAULT 1,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS election_candidates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id uuid REFERENCES election_positions(id) ON DELETE SET NULL,
  name        varchar(150) NOT NULL,
  name_hi     varchar(150),
  photo_url   text,
  bio         text,
  bio_hi      text,
  vote_count  integer NOT NULL DEFAULT 0,
  is_winner   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_votes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id      uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id     uuid NOT NULL REFERENCES election_candidates(id) ON DELETE CASCADE,
  voter_phone_hash text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_vote_per_election UNIQUE (election_id, voter_phone_hash)
);

CREATE INDEX IF NOT EXISTS idx_elections_phase        ON elections(phase);
CREATE INDEX IF NOT EXISTS idx_positions_election     ON election_positions(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_election    ON election_candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election         ON election_votes(election_id);

-- Row Level Security
ALTER TABLE elections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_positions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_votes      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elections_public_read"    ON elections           FOR SELECT TO anon USING (phase != 'DRAFT');
CREATE POLICY "positions_public_read"    ON election_positions  FOR SELECT TO anon USING (true);
CREATE POLICY "candidates_public_read"   ON election_candidates FOR SELECT TO anon USING (true);
CREATE POLICY "elections_admin_all"      ON elections           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "positions_admin_all"      ON election_positions  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "candidates_admin_all"     ON election_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "votes_admin_all"          ON election_votes      FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON elections, election_positions, election_candidates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON elections, election_positions, election_candidates, election_votes TO authenticated;
-- migration-004-user-profiles.sql
-- Run in Supabase SQL Editor. User profile extension with roles and ban management.

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  display_name varchar(100),
  role         user_role NOT NULL DEFAULT 'user',
  is_banned    boolean   NOT NULL DEFAULT false,
  ban_reason   text,
  banned_at    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role    ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_banned  ON user_profiles(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_profiles_created ON user_profiles(created_at DESC);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"  ON user_profiles FOR SELECT TO anon       USING (true);
CREATE POLICY "profiles_self_update"  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all"    ON user_profiles FOR ALL    TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
-- Site Settings — key/value store for platform configuration
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: public can read, only authenticated admins can write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings_admin_write"
  ON site_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Seed default settings (no-op if already exists)
INSERT INTO site_settings (key, value) VALUES
  ('youtube_video_url', NULL),
  ('site_notice',       NULL),
  ('ticker_enabled',    'true')
ON CONFLICT (key) DO NOTHING;
-- ================================================================
-- newmarket.co.in — Jobs Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status enum
--       and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────
create type job_type as enum (
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'SEASONAL'
);

create type job_category as enum (
  'RETAIL', 'FOOD_BEVERAGE', 'TAILORING', 'ELECTRONICS',
  'BEAUTY_WELLNESS', 'LOGISTICS_DELIVERY', 'MANAGEMENT',
  'SECURITY', 'HOUSEKEEPING', 'OTHER'
);

create type application_mode as enum (
  'WALK_IN', 'PHONE', 'EMAIL', 'ONLINE'
);

-- ── Table ─────────────────────────────────────────────────────────
create table job_listings (
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
create index idx_jobs_status     on job_listings(status);
create index idx_jobs_category   on job_listings(category);
create index idx_jobs_type       on job_listings(job_type);
create index idx_jobs_expires_at on job_listings(expires_at);

-- ── Updated-at trigger ────────────────────────────────────────────
create trigger job_listings_updated_at
  before update on job_listings
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
create policy "anon_select_approved_active"
  on job_listings for select to anon
  using (
    status = 'APPROVED'
    and (expires_at is null or expires_at > now())
  );

create policy "anon_insert_pending"
  on job_listings for insert to anon
  with check (status = 'PENDING');

create policy "admin_full_access"
  on job_listings for all to authenticated
  using (true) with check (true);
