-- 020: Add internal notes field to properties (admin-only, not visible to customers)
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT NULL;
