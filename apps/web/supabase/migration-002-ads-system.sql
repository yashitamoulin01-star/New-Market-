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

drop policy if exists "ads_public_read" on advertisements;
create policy "ads_public_read" on advertisements
  FOR SELECT TO anon
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at   IS NULL OR ends_at   >= now())
  );

drop policy if exists "ads_admin_all" on advertisements;
create policy "ads_admin_all" on advertisements
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT ON advertisements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON advertisements TO authenticated;
