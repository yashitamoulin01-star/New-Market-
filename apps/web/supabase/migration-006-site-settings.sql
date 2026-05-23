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
