-- ================================================================
-- newmarket.co.in — Property Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status
--       enum and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────

DO $$ BEGIN
  create type property_type as enum (
    'SHOP', 'OFFICE', 'WAREHOUSE', 'SHOWROOM', 'KIOSK', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type listing_type as enum (
    'RENT', 'SALE', 'LEASE'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── Table ─────────────────────────────────────────────────────────

create table if not exists property_listings (
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

create index if not exists idx_property_status on property_listings(status);
create index if not exists idx_property_type on property_listings(property_type);
create index if not exists idx_property_listing_type on property_listings(listing_type);
create index if not exists idx_property_expires_at on property_listings(expires_at);

-- ── Updated-at trigger ────────────────────────────────────────────

drop trigger if exists property_listings_updated_at on property_listings;
create trigger property_listings_updated_at before update on property_listings
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

drop policy if exists "anon_select_approved_active" on property_listings;
create policy "anon_select_approved_active" on property_listings for select to anon
  using (
    status = 'APPROVED'
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "anon_insert_pending" on property_listings;
create policy "anon_insert_pending" on property_listings for insert to anon
  with check (status = 'PENDING');

drop policy if exists "admin_full_access" on property_listings;
create policy "admin_full_access" on property_listings for all to authenticated
  using (true) with check (true);
