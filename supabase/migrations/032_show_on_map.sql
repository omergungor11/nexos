-- Add show_on_map boolean to properties table
-- Controls which properties appear on the public map page
ALTER TABLE properties ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN DEFAULT FALSE;

-- Partial index for efficient map page queries
CREATE INDEX IF NOT EXISTS idx_properties_show_on_map ON properties(show_on_map) WHERE show_on_map = TRUE;
