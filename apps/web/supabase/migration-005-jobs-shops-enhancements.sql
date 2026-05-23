-- migration-005-jobs-shops-enhancements.sql
-- Run in Supabase SQL Editor. Adds sponsored flag to job_listings and shops.

ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false;
ALTER TABLE shops        ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_jobs_sponsored  ON job_listings(is_sponsored) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_shops_sponsored ON shops(is_sponsored)        WHERE is_sponsored = true;
