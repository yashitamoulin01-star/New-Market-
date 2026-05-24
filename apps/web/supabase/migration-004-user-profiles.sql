-- migration-004-user-profiles.sql
-- Run in Supabase SQL Editor. User profile extension with roles and ban management.

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  display_name varchar(100),
  role         user_role NOT NULL DEFAULT 'user',
  is_banned    boolean   NOT NULL DEFAULT false,
  ban_reason   text,
  banned_at    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role    ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_banned  ON user_profiles(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_profiles_created ON user_profiles(created_at DESC);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

drop policy if exists "profiles_public_read" on user_profiles;
create policy "profiles_public_read" on user_profiles FOR SELECT TO anon       USING (true);
drop policy if exists "profiles_self_update" on user_profiles;
create policy "profiles_self_update" on user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
drop policy if exists "profiles_admin_all" on user_profiles;
create policy "profiles_admin_all" on user_profiles FOR ALL    TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
