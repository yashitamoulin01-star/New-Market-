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
drop policy if exists "comments_read" on article_comments;
create policy "comments_read" on article_comments for select
  using (true);

-- Authenticated users can insert (must own the row)
drop policy if exists "comments_insert" on article_comments;
create policy "comments_insert" on article_comments for insert to authenticated
  with check (user_id = auth.uid());

-- User can delete own; admin can delete any
drop policy if exists "comments_delete" on article_comments;
create policy "comments_delete" on article_comments for delete to authenticated
  using (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── RLS: reactions ────────────────────────────────────────────────

alter table reactions enable row level security;

drop policy if exists "reactions_read" on reactions;
create policy "reactions_read" on reactions for select
  using (true);

drop policy if exists "reactions_insert" on reactions;
create policy "reactions_insert" on reactions for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "reactions_update" on reactions;
create policy "reactions_update" on reactions for update to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "reactions_delete" on reactions;
create policy "reactions_delete" on reactions for delete to authenticated
  using (user_id = auth.uid());

-- ── Grants ────────────────────────────────────────────────────────

grant select                           on article_comments to anon;
grant select, insert, delete           on article_comments to authenticated;
grant select                           on reactions         to anon;
grant select, insert, update, delete   on reactions         to authenticated;
