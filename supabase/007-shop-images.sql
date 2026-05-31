-- Add gallery images array to shops table
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
