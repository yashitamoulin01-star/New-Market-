-- ================================================================
-- newmarket.co.in — Shops Module Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- NOTE: Requires news schema to have been run first (uses content_status
--       enum and update_updated_at_column function from that migration).
-- ================================================================

-- ── Enums ─────────────────────────────────────────────────────────

DO $$ BEGIN
  create type shop_category as enum (
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
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── Table ─────────────────────────────────────────────────────────

create table if not exists shops (
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

create index if not exists idx_shops_status on shops(status);
create index if not exists idx_shops_category on shops(category);
create index if not exists idx_shops_featured on shops(is_featured);

-- ── Updated-at trigger ────────────────────────────────────────────

drop trigger if exists shops_updated_at on shops;
create trigger shops_updated_at before update on shops
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

drop policy if exists "anon_select_approved" on shops;
create policy "anon_select_approved" on shops for select to anon
  using (status = 'APPROVED');

drop policy if exists "anon_insert_pending" on shops;
create policy "anon_insert_pending" on shops for insert to anon
  with check (status = 'PENDING');

drop policy if exists "admin_full_access" on shops;
create policy "admin_full_access" on shops for all to authenticated
  using (true) with check (true);
