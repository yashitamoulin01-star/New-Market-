-- ================================================================
-- Add is_anonymous flag to news_articles
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

-- Index for admin filtering by anonymous submissions
CREATE INDEX IF NOT EXISTS idx_news_anonymous
  ON news_articles(is_anonymous) WHERE is_anonymous = true;
