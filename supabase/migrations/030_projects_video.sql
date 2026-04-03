-- 030: Add video_url and developer_logo to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_logo TEXT DEFAULT NULL;
