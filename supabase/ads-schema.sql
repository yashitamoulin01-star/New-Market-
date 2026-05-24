-- Advertisements table
create table if not exists advertisements (
  id            uuid primary key default gen_random_uuid(),
  position      text not null check (position in ('top','bottom','left','right','middle')),
  title         text,
  image_url     text not null,
  link_url      text,
  is_active     boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Allow public reads (for displaying ads on the site)
alter table advertisements enable row level security;

create policy "Public can read active ads"
  on advertisements for select
  using (is_active = true);

create policy "Admins can manage ads"
  on advertisements for all
  using (
    (auth.jwt() ->> 'role') = 'service_role'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Storage bucket for user uploads (run once)
-- insert into storage.buckets (id, name, public)
-- values ('public-uploads', 'public-uploads', true)
-- on conflict do nothing;

-- Storage policy: anyone can upload images
-- create policy "Anyone can upload images"
--   on storage.objects for insert
--   with check (bucket_id = 'public-uploads');

-- create policy "Public can read uploads"
--   on storage.objects for select
--   using (bucket_id = 'public-uploads');
