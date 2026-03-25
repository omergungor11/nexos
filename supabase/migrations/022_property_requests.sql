CREATE TABLE property_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  property_type TEXT, -- villa, apartment, land etc
  transaction_type TEXT, -- sale, rent
  city_preference TEXT, -- preferred city
  min_price NUMERIC(15,2),
  max_price NUMERIC(15,2),
  currency TEXT DEFAULT 'GBP',
  min_area NUMERIC(10,2),
  rooms_preference TEXT, -- e.g. "3+1"
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','reviewing','matched','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE property_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_property_requests" ON property_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "admin_all_property_requests" ON property_requests FOR ALL USING (is_admin()) WITH CHECK (is_admin());
