-- Run this in Supabase SQL Editor
-- Creates the homepage_settings table for the Smart Adaptive Layout System

CREATE TABLE IF NOT EXISTS homepage_settings (
  id                     INTEGER PRIMARY KEY DEFAULT 1,
  -- Top bar
  show_ticker            BOOLEAN NOT NULL DEFAULT true,
  -- News zone
  show_top_ad            BOOLEAN NOT NULL DEFAULT true,
  show_hero_news         BOOLEAN NOT NULL DEFAULT true,
  show_mini_grid         BOOLEAN NOT NULL DEFAULT true,
  show_latest_panel      BOOLEAN NOT NULL DEFAULT true,
  show_trending          BOOLEAN NOT NULL DEFAULT true,
  show_text_stories      BOOLEAN NOT NULL DEFAULT true,
  -- Secondary content column
  show_jobs_panel        BOOLEAN NOT NULL DEFAULT true,
  show_section_links     BOOLEAN NOT NULL DEFAULT true,
  -- Mid page
  show_mid_ad            BOOLEAN NOT NULL DEFAULT true,
  show_youtube           BOOLEAN NOT NULL DEFAULT true,
  show_local_updates     BOOLEAN NOT NULL DEFAULT true,
  -- Sidebar
  show_elections         BOOLEAN NOT NULL DEFAULT true,
  show_property_panel    BOOLEAN NOT NULL DEFAULT true,
  -- Lower
  show_shops_strip       BOOLEAN NOT NULL DEFAULT true,
  show_community_strip   BOOLEAN NOT NULL DEFAULT true,
  show_bottom_ad         BOOLEAN NOT NULL DEFAULT true,
  -- Sidebar ad controls (xl screens only)
  show_left_ad           BOOLEAN NOT NULL DEFAULT true,
  show_right_ad          BOOLEAN NOT NULL DEFAULT true,
  -- Fallback: what fills the sidebar when ad is off
  left_sidebar_fallback  TEXT NOT NULL DEFAULT 'trending'
    CHECK (left_sidebar_fallback IN ('trending', 'latest', 'jobs', 'community', 'none')),
  right_sidebar_fallback TEXT NOT NULL DEFAULT 'community'
    CHECK (right_sidebar_fallback IN ('trending', 'latest', 'jobs', 'community', 'none')),
  -- Layout style
  hero_style             TEXT NOT NULL DEFAULT 'photo'
    CHECK (hero_style IN ('photo', 'text-split')),
  layout_density         TEXT NOT NULL DEFAULT 'spacious'
    CHECK (layout_density IN ('compact', 'spacious')),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: public read, no public write
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "homepage_settings_public_read" ON homepage_settings
  FOR SELECT USING (true);

-- Seed the single settings row
INSERT INTO homepage_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
