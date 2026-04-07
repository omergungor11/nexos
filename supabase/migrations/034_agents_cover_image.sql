-- Add cover_image column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS cover_image text;
