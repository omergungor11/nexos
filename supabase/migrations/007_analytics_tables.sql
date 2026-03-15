-- Migration 007: Analytics tables for property views and admin activity log

-- ─── property_views ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_session TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_property_views_property_date
  ON property_views(property_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_views_date
  ON property_views(viewed_at DESC);

-- ─── admin_activity_log ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created
  ON admin_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity
  ON admin_activity_log(entity_type, entity_id);
