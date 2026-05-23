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
