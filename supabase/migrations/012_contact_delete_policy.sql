-- Migration 012: Add DELETE policy for contact_requests
-- Run this in Supabase Dashboard SQL Editor

CREATE POLICY "admin_delete_contact" ON contact_requests
  FOR DELETE TO authenticated
  USING (TRUE);
