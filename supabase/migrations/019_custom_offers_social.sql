CREATE TYPE offer_status_enum AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

CREATE TABLE custom_offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  customer_email  TEXT,
  offer_price     NUMERIC(15, 2) NOT NULL,
  currency        currency_enum NOT NULL DEFAULT 'GBP',
  notes           TEXT,
  status          offer_status_enum NOT NULL DEFAULT 'draft',
  expires_at      TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  responded_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_custom_offers_property ON custom_offers(property_id);
CREATE INDEX idx_custom_offers_status ON custom_offers(status);
CREATE INDEX idx_custom_offers_created ON custom_offers(created_at DESC);

ALTER TABLE custom_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_custom_offers" ON custom_offers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_custom_offers" ON custom_offers FOR SELECT USING (TRUE);

CREATE TRIGGER trg_custom_offers_updated_at
  BEFORE UPDATE ON custom_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
