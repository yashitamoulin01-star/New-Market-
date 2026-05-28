-- Homepage Settings — single-row control table for homepage layout
-- Run this in Supabase SQL editor BEFORE using the Homepage Layout admin page.

CREATE TABLE IF NOT EXISTS homepage_settings (
  id                     INTEGER PRIMARY KEY DEFAULT 1,

  -- News Zone
  show_ticker            BOOLEAN NOT NULL DEFAULT TRUE,
  show_hero_news         BOOLEAN NOT NULL DEFAULT TRUE,
  show_mini_grid         BOOLEAN NOT NULL DEFAULT TRUE,
  show_latest_panel      BOOLEAN NOT NULL DEFAULT TRUE,
  show_trending          BOOLEAN NOT NULL DEFAULT TRUE,
  show_text_stories      BOOLEAN NOT NULL DEFAULT TRUE,
  show_section_links     BOOLEAN NOT NULL DEFAULT TRUE,

  -- Content Widgets
  show_jobs_panel        BOOLEAN NOT NULL DEFAULT TRUE,
  show_youtube           BOOLEAN NOT NULL DEFAULT TRUE,
  show_local_updates     BOOLEAN NOT NULL DEFAULT TRUE,
  show_elections         BOOLEAN NOT NULL DEFAULT TRUE,
  show_property_panel    BOOLEAN NOT NULL DEFAULT TRUE,
  show_shops_strip       BOOLEAN NOT NULL DEFAULT TRUE,
  show_community_strip   BOOLEAN NOT NULL DEFAULT TRUE,

  -- Ad Slots
  show_top_ad            BOOLEAN NOT NULL DEFAULT TRUE,
  show_left_ad           BOOLEAN NOT NULL DEFAULT TRUE,
  show_right_ad          BOOLEAN NOT NULL DEFAULT TRUE,
  show_mid_ad            BOOLEAN NOT NULL DEFAULT TRUE,
  show_bottom_ad         BOOLEAN NOT NULL DEFAULT TRUE,

  -- Sidebar fallback content
  left_sidebar_fallback  TEXT    NOT NULL DEFAULT 'trending',
  right_sidebar_fallback TEXT    NOT NULL DEFAULT 'community',

  -- Layout
  hero_style             TEXT    NOT NULL DEFAULT 'photo',
  layout_density         TEXT    NOT NULL DEFAULT 'spacious',

  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT homepage_settings_single_row CHECK (id = 1)
);

-- RLS: public can read settings, only admins can write
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_settings_public_read" ON homepage_settings;
CREATE POLICY "homepage_settings_public_read" ON homepage_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "homepage_settings_admin_write" ON homepage_settings;
CREATE POLICY "homepage_settings_admin_write" ON homepage_settings FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Seed the default row (no-op if it already exists)
INSERT INTO homepage_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
