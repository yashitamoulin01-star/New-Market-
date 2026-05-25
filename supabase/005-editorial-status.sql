-- Add EDITORIAL stage to news workflow: PENDING → EDITORIAL → APPROVED/REJECTED
-- Must be run outside a transaction block (PostgreSQL ENUM value addition)

ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'EDITORIAL' BEFORE 'APPROVED';

-- Optional: add editorial_notes column for admin internal notes during editing stage
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS editorial_notes text;
