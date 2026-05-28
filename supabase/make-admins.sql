-- Run this script in your Supabase SQL Editor to grant admin privileges

-- 1. Update the auth.users metadata so the user gets the admin role in their JWT token
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
WHERE email IN (
  'nareshchandermouli@gmail.com',
  'yashitamoulin01@gmail.com'
);

-- 2. Update the public.user_profiles table so the role is reflected in the database
UPDATE public.user_profiles
SET role = 'admin'
WHERE email IN (
  'nareshchandermouli@gmail.com',
  'yashitamoulin01@gmail,com'
);
