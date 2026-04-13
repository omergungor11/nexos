-- Arbitrary admin-defined "key: value" rows per project, shown in the
-- Fiyat & Birimler section (e.g. "Aidat" / "Peşinat Oranı" / anything).
-- Stored as JSONB array of {label, value} objects to keep the schema flat.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb;
