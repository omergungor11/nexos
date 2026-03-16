-- Migration 011: Enable RLS on admin_activity_log and add policies
-- Run this in Supabase Dashboard SQL Editor

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "admin_read_activity_log" ON admin_activity_log
  FOR SELECT USING (is_admin());

-- Authenticated users (admins) can insert logs
CREATE POLICY "admin_insert_activity_log" ON admin_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- Also enable RLS on property_views if not already enabled
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_views" ON property_views
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "admin_read_views" ON property_views
  FOR SELECT USING (is_admin());
