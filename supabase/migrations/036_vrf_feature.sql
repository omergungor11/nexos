-- Add VRF (Variable Refrigerant Flow) climate system as a feature
INSERT INTO features (name, slug, icon, category, sort_order) VALUES
  ('VRF Klima Sistemi', 'vrf-klima', 'Snowflake', 'building', 25)
ON CONFLICT (slug) DO NOTHING;
