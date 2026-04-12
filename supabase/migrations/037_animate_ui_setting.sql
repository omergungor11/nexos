-- Add animate_ui_enabled setting
INSERT INTO site_settings (key, value, category)
VALUES ('animate_ui_enabled', 'false', 'appearance')
ON CONFLICT (key) DO NOTHING;
