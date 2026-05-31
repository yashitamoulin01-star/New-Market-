-- 008-ads-schema-update.sql
-- Migrate advertisements table to new schema (slot/priority/starts_at/ends_at/click_count)
-- Safe to run multiple times (all operations are idempotent)

-- 1. Add new columns (safe to run even if they already exist)
alter table advertisements
  add column if not exists slot        text,
  add column if not exists priority    integer not null default 10,
  add column if not exists starts_at   timestamptz,
  add column if not exists ends_at     timestamptz,
  add column if not exists click_count integer not null default 0;

-- 2. Migrate old `position` values → slot (only if `position` column exists)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'advertisements' and column_name = 'position'
  ) then
    update advertisements
    set slot = case position
      when 'top'    then 'homepage-top'
      when 'bottom' then 'homepage-bottom'
      when 'left'   then 'homepage-left'
      when 'right'  then 'homepage-right'
      when 'middle' then 'homepage-mid-1'
      else 'homepage-top'
    end
    where slot is null;
  end if;
end $$;

-- 3. Fill any remaining null slots with a default
update advertisements set slot = 'homepage-top' where slot is null;

-- 4. Ensure slot is not null
alter table advertisements
  alter column slot set not null;

-- 5. Migrate display_order → priority where still at default (only if column exists)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'advertisements' and column_name = 'display_order'
  ) then
    update advertisements
      set priority = display_order
      where display_order is not null and display_order > 0 and priority = 10;
  end if;
end $$;

-- 5. Ensure title is not null (old rows may have been null)
update advertisements set title = 'Advertisement' where title is null;
alter table advertisements
  alter column title set not null,
  alter column title set default 'Advertisement';

-- 6. RPC for click tracking
create or replace function increment_ad_click(ad_id uuid)
returns void
language sql
security definer
as $$
  update advertisements set click_count = click_count + 1 where id = ad_id;
$$;

-- 7. Refresh RLS policies to allow admins to read ALL ads (not just active)
drop policy if exists "Public can read active ads" on advertisements;
drop policy if exists "Admins can manage ads"      on advertisements;

create policy "Public can read active ads"
  on advertisements for select
  using (is_active = true);

create policy "Admins can manage ads"
  on advertisements for all
  using  ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
