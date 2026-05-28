-- ─────────────────────────────────────────────────────────────────
-- STORAGE CLEANUP — Find & delete orphaned uploads
-- Run in Supabase SQL Editor → Dashboard → SQL Editor
--
-- STEP 1: Run the SELECT block below first to PREVIEW what will be deleted.
-- STEP 2: Only run the DELETE block after you are satisfied.
-- ─────────────────────────────────────────────────────────────────

-- ── STEP 1: Preview orphaned files ───────────────────────────────
-- Shows all files in the public-uploads bucket that are NOT
-- referenced by any content in the database.

WITH used_urls AS (
  -- News article cover images
  SELECT cover_image_url AS url FROM news_articles WHERE cover_image_url IS NOT NULL

  UNION

  -- Shop logos and cover images
  SELECT logo_url        FROM shops WHERE logo_url        IS NOT NULL
  UNION
  SELECT cover_image_url FROM shops WHERE cover_image_url IS NOT NULL

  UNION

  -- Property listing images (stored as text array)
  SELECT unnest(images)
  FROM property_listings
  WHERE images IS NOT NULL AND array_length(images, 1) > 0

  UNION

  -- Advertisement images
  SELECT image_url FROM advertisements WHERE image_url IS NOT NULL
),

storage_files AS (
  SELECT
    name,
    id,
    created_at,
    (metadata->>'size')::bigint AS size_bytes,
    'https://' || current_setting('app.supabase_url', true)
      || '/storage/v1/object/public/public-uploads/' || name AS reconstructed_url
  FROM storage.objects
  WHERE bucket_id = 'public-uploads'
    AND name LIKE 'uploads/%'
)

SELECT
  sf.name                                          AS file_path,
  sf.size_bytes                                    AS size_bytes,
  round(sf.size_bytes / 1024.0 / 1024.0, 2)       AS size_mb,
  sf.created_at                                    AS uploaded_at,
  CASE WHEN uu.url IS NULL THEN 'ORPHANED' ELSE 'IN USE' END AS status
FROM storage_files sf
LEFT JOIN used_urls uu
  ON uu.url LIKE '%' || sf.name
ORDER BY status DESC, sf.created_at ASC;


-- ── STEP 2: Delete orphaned files (uncomment to run) ─────────────
-- Only run this AFTER reviewing the preview above.
-- This permanently deletes files not linked to any content.

/*
DELETE FROM storage.objects
WHERE bucket_id = 'public-uploads'
  AND name LIKE 'uploads/%'
  AND id NOT IN (
    SELECT so.id
    FROM storage.objects so
    INNER JOIN (
      SELECT cover_image_url AS url FROM news_articles WHERE cover_image_url IS NOT NULL
      UNION
      SELECT logo_url        FROM shops WHERE logo_url        IS NOT NULL
      UNION
      SELECT cover_image_url FROM shops WHERE cover_image_url IS NOT NULL
      UNION
      SELECT unnest(images)
        FROM property_listings WHERE images IS NOT NULL AND array_length(images, 1) > 0
      UNION
      SELECT image_url FROM advertisements WHERE image_url IS NOT NULL
    ) used ON used.url LIKE '%' || so.name
    WHERE so.bucket_id = 'public-uploads'
  );
*/
