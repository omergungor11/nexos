-- Remove developer columns from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS developer;
ALTER TABLE projects DROP COLUMN IF EXISTS developer_logo;
