-- Visual Layout Builder — adds layout_config JSONB column to homepage_settings
-- Run AFTER migration-007-homepage-settings.sql
-- Run this in Supabase SQL editor

ALTER TABLE homepage_settings
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT NULL;
