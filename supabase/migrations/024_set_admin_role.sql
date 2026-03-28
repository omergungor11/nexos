-- 024: Set admin role for users
-- Run this in Supabase Dashboard > SQL Editor
-- Replace 'EMAIL_HERE' with the actual email address

-- Option 1: Set role via user_metadata for a specific user
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'EMAIL_HERE';

-- Option 2: Set ALL existing users as admin (use carefully)
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb;
