-- 021: Add sort_order to agents + fix city display order
ALTER TABLE agents ADD COLUMN IF NOT EXISTS sort_order SMALLINT DEFAULT 0;

-- Set Neşe first
UPDATE agents SET sort_order = 1 WHERE name ILIKE '%neşe%' OR name ILIKE '%nese%';
UPDATE agents SET sort_order = 10 WHERE sort_order = 0;

-- Fix city names display (ensure correct Turkish spelling)
UPDATE cities SET name = 'Gazimağusa' WHERE slug = 'gazimagusa';
UPDATE cities SET name = 'İskele' WHERE slug = 'iskele';
UPDATE cities SET name = 'Lefkoşa' WHERE slug = 'lefkosa';
UPDATE cities SET name = 'Girne' WHERE slug = 'girne';
UPDATE cities SET name = 'Güzelyurt' WHERE slug = 'guzelyurt';
UPDATE cities SET name = 'Lefke' WHERE slug = 'lefke';
