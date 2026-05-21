-- ================================================================
-- newmarket.co.in — News Module Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── Extensions ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────
create type content_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create type news_category as enum (
  'GENERAL', 'EVENTS', 'NOTICES', 'BUSINESS',
  'COMMUNITY', 'SAFETY', 'TRAFFIC'
);

-- ── Table ─────────────────────────────────────────────────────────
create table news_articles (
  id              uuid primary key default uuid_generate_v4(),

  title           varchar(200) not null,
  slug            varchar(220) unique not null,
  excerpt         varchar(500),
  content         text not null,
  cover_image_url text,

  category        news_category not null default 'GENERAL',
  tags            text[] not null default '{}',

  submitter_name  varchar(100) not null,
  submitter_email varchar(255) not null,
  submitter_phone varchar(15),

  status          content_status not null default 'PENDING',
  rejection_note  text,
  reviewed_at     timestamptz,

  published_at    timestamptz,
  is_featured     boolean not null default false,
  view_count      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────
create index idx_news_status        on news_articles(status);
create index idx_news_category      on news_articles(category);
create index idx_news_published_at  on news_articles(published_at desc) where status = 'APPROVED';
create index idx_news_slug          on news_articles(slug);

-- ── Updated-at trigger ────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger news_articles_updated_at
  before update on news_articles
  for each row execute function update_updated_at_column();

-- ── View-count RPC (runs as postgres to bypass RLS) ───────────────
create or replace function increment_news_view(article_id uuid)
returns void as $$
  update news_articles
  set view_count = view_count + 1
  where id = article_id and status = 'APPROVED';
$$ language sql security definer;

-- ── Grants ────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select                            on news_articles to anon;
grant insert                            on news_articles to anon;
grant select, insert, update, delete    on news_articles to authenticated;
grant execute on function increment_news_view to anon, authenticated;

-- ── Row Level Security ────────────────────────────────────────────
alter table news_articles enable row level security;

-- Public reads only approved articles
create policy "anon_select_approved"
  on news_articles for select to anon
  using (status = 'APPROVED');

-- Public can submit — only with PENDING status
create policy "anon_insert_pending"
  on news_articles for insert to anon
  with check (status = 'PENDING');

-- Authenticated admins have full access
create policy "admin_full_access"
  on news_articles for all to authenticated
  using (true) with check (true);
