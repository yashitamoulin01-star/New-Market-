-- Admin role management
-- Run this in Supabase SQL editor → Dashboard → SQL Editor

-- Grant admin to the two authorised accounts
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email IN (
  'yashitamoulin01@gmail.com',
  'nareshchandermouli@gmail.com'
);

-- Strip admin from any other previously-granted accounts
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email NOT IN (
  'yashitamoulin01@gmail.com',
  'nareshchandermouli@gmail.com'
)
AND raw_user_meta_data->>'role' = 'admin';

-- Verify
SELECT id, email, raw_user_meta_data->>'role' AS role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
   OR email IN ('yashitamouli01@gmail.com', 'nareshchandermouli@gmail.com');
