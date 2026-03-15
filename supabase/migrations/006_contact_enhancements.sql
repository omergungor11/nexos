-- Migration 006: Contact request enhancements
-- Add assigned_agent_id and admin_notes columns to contact_requests

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Index for filtering by assigned agent
CREATE INDEX IF NOT EXISTS idx_contact_requests_assigned_agent
  ON contact_requests(assigned_agent_id)
  WHERE assigned_agent_id IS NOT NULL;
