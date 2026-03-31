-- 026: Add category column + seed new settings
-- Run in Supabase Dashboard > SQL Editor

-- Step 1: Add category column if missing
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Step 2: Update existing rows with categories
UPDATE site_settings SET category = 'company' WHERE key LIKE 'company_%';
UPDATE site_settings SET category = 'hero' WHERE key LIKE 'hero_%';
UPDATE site_settings SET category = 'social' WHERE key LIKE 'social_%';

-- Step 3: Seed new settings
INSERT INTO site_settings (key, value, value_type, label, category) VALUES
  ('site_title', 'Nexos Investment', 'string', 'Site Başlığı', 'general'),
  ('site_description', 'Kuzey Kıbrıs gayrimenkul danışmanlığı', 'string', 'Site Açıklaması', 'general'),
  ('primary_color', '#ffca3e', 'color', 'Ana Renk', 'general'),
  ('google_maps_link', 'https://maps.app.goo.gl/jUajHgW2DWPzDKfJA', 'url', 'Google Maps Linki', 'general'),
  ('meta_title_template', '%s | Nexos Investment', 'string', 'Meta Başlık Şablonu', 'seo'),
  ('default_meta_description', 'Kuzey Kıbrıs''ta güvenilir gayrimenkul danışmanlığı', 'string', 'Varsayılan Meta Açıklama', 'seo'),
  ('google_analytics_id', '', 'string', 'Google Analytics ID', 'seo'),
  ('search_console_verification', '', 'string', 'Search Console Doğrulama', 'seo'),
  ('whatsapp_number', '+905488604030', 'string', 'WhatsApp Numarası', 'contact'),
  ('working_hours_weekdays', '09:00-18:00', 'string', 'Hafta İçi', 'contact'),
  ('working_hours_saturday', '09:00-14:00', 'string', 'Cumartesi', 'contact'),
  ('working_hours_sunday', 'Kapalı', 'string', 'Pazar', 'contact'),
  ('office_lat', '35.160', 'string', 'Ofis Enlem', 'contact'),
  ('office_lng', '33.880', 'string', 'Ofis Boylam', 'contact'),
  ('social_tiktok', 'https://www.tiktok.com/@nexosinvestment', 'url', 'TikTok', 'social'),
  ('default_hashtags', 'KuzeyKıbrıs,KKTC,NexosInvestment,Emlak', 'string', 'Varsayılan Hashtagler', 'social'),
  ('notification_email', 'info@nexosinvestment.com', 'string', 'Bildirim E-postası', 'email'),
  ('theme_default', 'system', 'string', 'Varsayılan Tema', 'appearance'),
  ('homepage_deals_visible', 'true', 'boolean', 'Fırsat İlanlar', 'appearance'),
  ('homepage_featured_visible', 'true', 'boolean', 'Vitrin', 'appearance'),
  ('homepage_blog_visible', 'true', 'boolean', 'Blog', 'appearance'),
  ('homepage_video_visible', 'true', 'boolean', 'Video', 'appearance'),
  ('homepage_slider_visible', 'true', 'boolean', 'Slider', 'appearance'),
  ('notify_new_contact', 'true', 'boolean', 'Yeni İletişim', 'notifications'),
  ('notify_new_offer', 'true', 'boolean', 'Yeni Teklif', 'notifications'),
  ('notify_property_expiry', 'true', 'boolean', 'İlan Süresi Dolma', 'notifications')
ON CONFLICT (key) DO NOTHING;

-- Step 4: Update existing social URLs
UPDATE site_settings SET value = 'https://www.facebook.com/nexosinvestment', category = 'social' WHERE key = 'social_facebook' AND (value IS NULL OR value = '');
UPDATE site_settings SET value = 'https://www.instagram.com/nexosinvestment', category = 'social' WHERE key = 'social_instagram' AND (value IS NULL OR value = '');
UPDATE site_settings SET value = 'https://www.youtube.com/@nexosinvestment', category = 'social' WHERE key = 'social_youtube' AND (value IS NULL OR value = '');
UPDATE site_settings SET value = '+905488604030' WHERE key = 'company_phone';
UPDATE site_settings SET value = 'info@nexosinvestment.com' WHERE key = 'company_email';
