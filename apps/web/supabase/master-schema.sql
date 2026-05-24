-- Combined Master Schema for Newmarket.co.in
-- Safe to run multiple times

-- =========================================
-- FROM: schema.sql
-- =========================================

-- ================================================================
-- newmarket.co.in — News Module Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── Extensions ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE news_category AS ENUM (
  'GENERAL', 'EVENTS', 'NOTICES', 'BUSINESS',
  'COMMUNITY', 'SAFETY', 'TRAFFIC'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── Table ─────────────────────────────────────────────────────────
create table news_articles (
  id              uuid primary key default uuid_generate_v4(),

  title           varchar(200) not null,
  slug            varchar(220) unique not null,
  excerpt         varchar(500),
  content         text not null,
  cover_image_url text,

  category        news_category not null default 'GENERAL',
  tags            text[] not null default '{}',

  submitter_name  varchar(100) not null,
  submitter_email varchar(255) not null,
  submitter_phone varchar(15),

  status          content_status not null default 'PENDING',
  rejection_note  text,
  reviewed_at     timestamptz,

  published_at    timestamptz,
  is_featured     boolean not null default false,
  view_count      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────
create index idx_news_status        on news_articles(status);
create index idx_news_category      on news_articles(category);
create index idx_news_published_at  on news_articles(published_at desc) where status = 'APPROVED';
create index idx_news_slug          on news_articles(slug);

-- ── Updated-at trigger ────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger news_articles_updated_at
  before update on news_articles
  for each row execute function update_updated_at_column();

-- ── View-count RPC (runs as postgres to bypass RLS) ───────────────
create or replace function increment_news_view(article_id uuid)
returns void as $$
  update news_articles
  set view_count = view_count + 1
  where id = article_id and status = 'APPROVED';
$$ language sql security definer;

-- ── Grants ────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select                            on news_articles to anon;
grant insert                            on news_articles to anon;
grant select, insert, update, delete    on news_articles to authenticated;
grant execute on function increment_news_view to anon, authenticated;

-- ── Row Level Security ────────────────────────────────────────────
alter table news_articles enable row level security;

-- Public reads only approved articles
create policy "anon_select_approved"
  on news_articles for select to anon
  using (status = 'APPROVED');

-- Public can submit — only with PENDING status
create policy "anon_insert_pending"
  on news_articles for insert to anon
  with check (status = 'PENDING');

-- Authenticated admins have full access
create policy "admin_full_access"
  on news_articles for all to authenticated
  using (true) with check (true);


-- =========================================
-- FROM: jobs-schema.sql
-- =========================================

-- ================================================================
-- newmarket.co.in — Jobs Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status enum
--       and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE job_type AS ENUM (
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'SEASONAL'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_category AS ENUM (
  'RETAIL', 'FOOD_BEVERAGE', 'TAILORING', 'ELECTRONICS',
  'BEAUTY_WELLNESS', 'LOGISTICS_DELIVERY', 'MANAGEMENT',
  'SECURITY', 'HOUSEKEEPING', 'OTHER'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_mode AS ENUM (
  'WALK_IN', 'PHONE', 'EMAIL', 'ONLINE'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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


-- =========================================
-- FROM: shops-schema.sql
-- =========================================

-- ================================================================
-- newmarket.co.in — Shops Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status
--       enum and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE shop_category AS ENUM (
  'CLOTHING',
  'FOOD_BEVERAGE',
  'ELECTRONICS',
  'BEAUTY_WELLNESS',
  'TAILORING',
  'JEWELRY',
  'PHARMACY',
  'BOOKS_STATIONERY',
  'FOOTWEAR',
  'HANDICRAFTS',
  'MOBILE_ACCESSORIES',
  'OPTICALS',
  'OTHER'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── Table ─────────────────────────────────────────────────────────

create table shops (
  id               uuid primary key default uuid_generate_v4(),

  -- Core info
  name             varchar(150) not null,
  description      text not null,
  category         shop_category not null,

  -- Location
  address          varchar(300) not null,

  -- Contact
  phone            varchar(15),
  email            varchar(255),
  website          text,

  -- Media
  logo_url         text,
  cover_image_url  text,

  -- Operations
  opening_hours    varchar(200),              -- e.g. "10am – 9pm, Mon–Sat"
  tags             text[] not null default '{}',

  -- Moderation
  status           content_status not null default 'PENDING',
  is_verified      boolean not null default false,
  rejection_note   text,
  reviewed_at      timestamptz,

  -- Visibility
  is_featured      boolean not null default false,
  view_count       integer not null default 0,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────

create index idx_shops_status   on shops(status);
create index idx_shops_category on shops(category);
create index idx_shops_featured on shops(is_featured);

-- ── Updated-at trigger ────────────────────────────────────────────

create trigger shops_updated_at
  before update on shops
  for each row execute function update_updated_at_column();

-- ── View-count RPC ────────────────────────────────────────────────

create or replace function increment_shop_view(shop_id uuid)
returns void as $$
  update shops
  set view_count = view_count + 1
  where id = shop_id and status = 'APPROVED';
$$ language sql security definer;

-- ── Grants ────────────────────────────────────────────────────────

grant select        on shops to anon;
grant insert        on shops to anon;
grant select, insert, update, delete on shops to authenticated;
grant execute on function increment_shop_view to anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────

alter table shops enable row level security;

create policy "anon_select_approved"
  on shops for select to anon
  using (status = 'APPROVED');

create policy "anon_insert_pending"
  on shops for insert to anon
  with check (status = 'PENDING');

create policy "admin_full_access"
  on shops for all to authenticated
  using (true) with check (true);


-- =========================================
-- FROM: property-schema.sql
-- =========================================

-- ================================================================
-- newmarket.co.in — Property Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status
--       enum and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM (
  'SHOP', 'OFFICE', 'WAREHOUSE', 'SHOWROOM', 'KIOSK', 'OTHER'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM (
  'RENT', 'SALE', 'LEASE'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── Table ─────────────────────────────────────────────────────────

create table property_listings (
  id               uuid primary key default uuid_generate_v4(),

  -- Core
  title            varchar(200) not null,
  description      text not null,
  property_type    property_type not null,
  listing_type     listing_type not null,

  -- Location
  address          varchar(300) not null,
  floor            varchar(50),             -- e.g. "Ground Floor", "2nd Floor"

  -- Size
  area_sqft        integer,                 -- square feet

  -- Pricing
  price            integer,                 -- monthly rent or total sale price (INR)
  price_label      varchar(100),            -- override e.g. "Negotiable"
  deposit          integer,                 -- security deposit for rentals (INR)

  -- Features
  is_furnished     boolean not null default false,
  amenities        text[] not null default '{}',  -- parking, AC, lift, etc.

  -- Media
  images           text[] not null default '{}',  -- array of image URLs

  -- Contact
  contact_name     varchar(100) not null,
  contact_phone    varchar(15),
  contact_email    varchar(255) not null,

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

create index idx_property_status       on property_listings(status);
create index idx_property_type         on property_listings(property_type);
create index idx_property_listing_type on property_listings(listing_type);
create index idx_property_expires_at   on property_listings(expires_at);

-- ── Updated-at trigger ────────────────────────────────────────────

create trigger property_listings_updated_at
  before update on property_listings
  for each row execute function update_updated_at_column();

-- ── View-count RPC ────────────────────────────────────────────────

create or replace function increment_property_view(property_id uuid)
returns void as $$
  update property_listings
  set view_count = view_count + 1
  where id = property_id and status = 'APPROVED';
$$ language sql security definer;

-- ── Grants ────────────────────────────────────────────────────────

grant select        on property_listings to anon;
grant insert        on property_listings to anon;
grant select, insert, update, delete on property_listings to authenticated;
grant execute on function increment_property_view to anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────

alter table property_listings enable row level security;

create policy "anon_select_approved_active"
  on property_listings for select to anon
  using (
    status = 'APPROVED'
    and (expires_at is null or expires_at > now())
  );

create policy "anon_insert_pending"
  on property_listings for insert to anon
  with check (status = 'PENDING');

create policy "admin_full_access"
  on property_listings for all to authenticated
  using (true) with check (true);


-- =========================================
-- FROM: comments-schema.sql
-- =========================================

-- ================================================================
-- newmarket.co.in — Comments & Reactions Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Run AFTER schema.sql (news_articles table must exist first)
-- ================================================================

-- ── Comments ──────────────────────────────────────────────────────

create table if not exists article_comments (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid not null references news_articles(id) on delete cascade,
  user_id    uuid not null references auth.users(id)     on delete cascade,
  user_name  text not null,
  content    text not null,
  created_at timestamptz not null default now(),
  constraint comment_content_length check (char_length(content) between 1 and 500)
);

create index if not exists idx_comments_article on article_comments(article_id, created_at);

-- ── Reactions ─────────────────────────────────────────────────────

create table if not exists reactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('article', 'comment')),
  target_id   uuid not null,
  reaction    text not null check (reaction in ('up', 'down')),
  created_at  timestamptz not null default now(),
  constraint unique_user_reaction unique(user_id, target_type, target_id)
);

create index if not exists idx_reactions_target on reactions(target_type, target_id);
create index if not exists idx_reactions_user   on reactions(user_id);

-- ── RLS: article_comments ─────────────────────────────────────────

alter table article_comments enable row level security;

-- Anyone can read comments
create policy "comments_read"
  on article_comments for select
  using (true);

-- Authenticated users can insert (must own the row)
create policy "comments_insert"
  on article_comments for insert to authenticated
  with check (user_id = auth.uid());

-- User can delete own; admin can delete any
create policy "comments_delete"
  on article_comments for delete to authenticated
  using (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── RLS: reactions ────────────────────────────────────────────────

alter table reactions enable row level security;

create policy "reactions_read"
  on reactions for select
  using (true);

create policy "reactions_insert"
  on reactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "reactions_update"
  on reactions for update to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reactions_delete"
  on reactions for delete to authenticated
  using (user_id = auth.uid());

-- ── Grants ────────────────────────────────────────────────────────

grant select                           on article_comments to anon;
grant select, insert, delete           on article_comments to authenticated;
grant select                           on reactions         to anon;
grant select, insert, update, delete   on reactions         to authenticated;


-- =========================================
-- FROM: migration-001-news-enhancements.sql
-- =========================================

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


-- =========================================
-- FROM: migration-002-ads-system.sql
-- =========================================

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


-- =========================================
-- FROM: migration-003-elections.sql
-- =========================================

-- migration-003-elections.sql
-- Run in Supabase SQL Editor. Full election CMS tables.

DO $ BEGIN
  CREATE TYPE election_phase AS ENUM (
    'DRAFT',
    'NOMINATIONS_OPEN',
    'VOTING_OPEN',
    'CLOSED',
    'RESULTS_PUBLISHED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $;

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


-- =========================================
-- FROM: migration-004-user-profiles.sql
-- =========================================

-- migration-004-user-profiles.sql
-- Run in Supabase SQL Editor. User profile extension with roles and ban management.

DO $ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $;

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


-- =========================================
-- FROM: migration-005-jobs-shops-enhancements.sql
-- =========================================

-- migration-005-jobs-shops-enhancements.sql
-- Run in Supabase SQL Editor. Adds sponsored flag to job_listings and shops.

ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false;
ALTER TABLE shops        ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_jobs_sponsored  ON job_listings(is_sponsored) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_shops_sponsored ON shops(is_sponsored)        WHERE is_sponsored = true;


-- =========================================
-- FROM: migration-006-site-settings.sql
-- =========================================

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


-- =========================================
-- FROM: production-fix.sql
-- =========================================

-- ================================================================
-- NewMarket.co.in — Production Fix Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run multiple times (all statements use IF NOT EXISTS / OR REPLACE)
-- ================================================================

-- ── 1. Add is_anonymous column if missing ─────────────────────────
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_news_anonymous
  ON news_articles(is_anonymous) WHERE is_anonymous = true;

-- ── 2. Create article_comments table if it doesn't exist ─────────
CREATE TABLE IF NOT EXISTS article_comments (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid not null references news_articles(id) on delete cascade,
  user_id    uuid not null references auth.users(id)    on delete cascade,
  user_name  text not null,
  content    text not null,
  created_at timestamptz not null default now(),
  constraint comment_content_length check (char_length(content) between 1 and 500)
);

CREATE INDEX IF NOT EXISTS idx_comments_article ON article_comments(article_id, created_at);

-- ── 3. Create reactions table if it doesn't exist ─────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('article', 'comment')),
  target_id   uuid not null,
  reaction    text not null check (reaction in ('up', 'down')),
  created_at  timestamptz not null default now(),
  constraint unique_user_reaction unique(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user   ON reactions(user_id);

-- ── 4. Ensure article_comments RLS policies are correct ───────────
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_read"   ON article_comments;
DROP POLICY IF EXISTS "comments_insert" ON article_comments;
DROP POLICY IF EXISTS "comments_delete" ON article_comments;

CREATE POLICY "comments_read"
  ON article_comments FOR SELECT
  USING (true);

CREATE POLICY "comments_insert"
  ON article_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_delete"
  ON article_comments FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 5. Ensure reactions RLS is correct ───────────────────────────
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_read"   ON reactions;
DROP POLICY IF EXISTS "reactions_insert" ON reactions;
DROP POLICY IF EXISTS "reactions_update" ON reactions;
DROP POLICY IF EXISTS "reactions_delete" ON reactions;

CREATE POLICY "reactions_read"
  ON reactions FOR SELECT USING (true);

CREATE POLICY "reactions_insert"
  ON reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_update"
  ON reactions FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete"
  ON reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── 6. Ensure grants are correct for all tables ───────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT                         ON news_articles TO anon;
GRANT INSERT                         ON news_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON news_articles TO authenticated;

GRANT SELECT                         ON article_comments TO anon;
GRANT SELECT, INSERT, DELETE         ON article_comments TO authenticated;

GRANT SELECT                         ON reactions         TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reactions         TO authenticated;

GRANT SELECT                         ON job_listings TO anon;
GRANT INSERT                         ON job_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_listings TO authenticated;

GRANT SELECT                         ON shops TO anon;
GRANT INSERT                         ON shops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON shops TO authenticated;

GRANT SELECT                         ON property_listings TO anon;
GRANT INSERT                         ON property_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_listings TO authenticated;

-- ── 7. Ensure increment RPCs exist ────────────────────────────────
CREATE OR REPLACE FUNCTION increment_news_view(article_id uuid)
RETURNS void AS $$
  UPDATE news_articles
  SET view_count = view_count + 1
  WHERE id = article_id AND status = 'APPROVED';
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_job_view(job_id uuid)
RETURNS void AS $$
  UPDATE job_listings
  SET view_count = view_count + 1
  WHERE id = job_id AND status = 'APPROVED';
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_shop_view(shop_id uuid)
RETURNS void AS $$
  UPDATE shops
  SET view_count = view_count + 1
  WHERE id = shop_id AND status = 'APPROVED';
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_property_view(property_id uuid)
RETURNS void AS $$
  UPDATE property_listings
  SET view_count = view_count + 1
  WHERE id = property_id AND status = 'APPROVED';
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_news_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_job_view  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_shop_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_property_view TO anon, authenticated;


