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

drop policy if exists "comments_read" on article_comments;
create policy "comments_read" on article_comments FOR SELECT
  USING (true);

drop policy if exists "comments_insert" on article_comments;
create policy "comments_insert" on article_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

drop policy if exists "comments_delete" on article_comments;
create policy "comments_delete" on article_comments FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 5. Ensure reactions RLS is correct ───────────────────────────
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_read"   ON reactions;

drop policy if exists "reactions_read" on reactions;
create policy "reactions_read" on reactions FOR SELECT USING (true);

drop policy if exists "reactions_insert" on reactions;
create policy "reactions_insert" on reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

drop policy if exists "reactions_update" on reactions;
create policy "reactions_update" on reactions FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

drop policy if exists "reactions_delete" on reactions;
create policy "reactions_delete" on reactions FOR DELETE TO authenticated
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
