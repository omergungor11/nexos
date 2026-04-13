-- ============================================================================
-- Property Workflow Status System
-- ============================================================================
-- Adds explicit 4-state workflow (draft/published/passive/archived) separate
-- from the existing business status (available/sold/rented/reserved).
--
-- STRATEGY: Additive + bidirectional sync via trigger. Existing `is_active`
-- boolean is preserved and kept in sync so that legacy code paths and the
-- existing RLS policy continue to work without modification. Once the full
-- codebase migrates to `workflow_status`, a follow-up migration can drop
-- `is_active` and rewrite the RLS policy.
-- ============================================================================

-- 1. Enum ---------------------------------------------------------------------

CREATE TYPE property_workflow_status_enum AS ENUM (
  'draft',      -- Incomplete, admin working, never public
  'published',  -- Live, visible to public
  'passive',    -- Temporarily hidden (price update, negotiation, etc.)
  'archived'    -- Long-term hidden, SEO tombstone
);

-- 2. Column -------------------------------------------------------------------

ALTER TABLE properties
  ADD COLUMN workflow_status property_workflow_status_enum NOT NULL DEFAULT 'draft';

-- 3. Backfill existing rows ---------------------------------------------------
--    is_active=TRUE                               → 'published'
--    is_active=FALSE AND very recent (<7d)        → 'draft' (likely unfinished)
--    is_active=FALSE AND older                    → 'passive' (was live, taken down)

UPDATE properties
SET workflow_status = CASE
  WHEN is_active = TRUE                                   THEN 'published'::property_workflow_status_enum
  WHEN (updated_at - created_at) < INTERVAL '7 days'      THEN 'draft'::property_workflow_status_enum
  ELSE                                                         'passive'::property_workflow_status_enum
END;

-- 4. Indexes ------------------------------------------------------------------

CREATE INDEX idx_properties_workflow_status
  ON properties(workflow_status);

CREATE INDEX idx_properties_workflow_published
  ON properties(workflow_status)
  WHERE workflow_status = 'published';

-- 5. Sync trigger -------------------------------------------------------------
--
--    Keeps `is_active` in sync with `workflow_status` so that:
--      a) legacy code writing `is_active` still produces a coherent state
--      b) existing RLS policy `USING (is_active = TRUE)` continues to work
--      c) new code writing `workflow_status` is the source of truth

CREATE OR REPLACE FUNCTION sync_property_workflow_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Legacy insert path: caller sets is_active=TRUE but leaves workflow_status
    -- at its default ('draft'). Treat that as a publish intent.
    IF NEW.workflow_status = 'draft' AND NEW.is_active = TRUE THEN
      NEW.workflow_status := 'published';
    ELSE
      -- New code path OR legacy is_active=FALSE: derive is_active from workflow_status
      NEW.is_active := (NEW.workflow_status = 'published');
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE path:
  --   If workflow_status changed     → is_active follows
  --   Else if is_active changed      → map to workflow_status (legacy callers)
  IF NEW.workflow_status IS DISTINCT FROM OLD.workflow_status THEN
    NEW.is_active := (NEW.workflow_status = 'published');
  ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    IF NEW.is_active = TRUE THEN
      NEW.workflow_status := 'published';
    ELSE
      -- is_active turned FALSE: preserve 'draft' if we were drafting, else 'passive'.
      -- Archived stays archived (legacy callers never set archived).
      NEW.workflow_status := CASE
        WHEN OLD.workflow_status = 'draft'    THEN 'draft'
        WHEN OLD.workflow_status = 'archived' THEN 'archived'
        ELSE                                       'passive'
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_property_workflow_status ON properties;
CREATE TRIGGER trg_sync_property_workflow_status
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION sync_property_workflow_status();

-- 6. Comment for documentation -----------------------------------------------

COMMENT ON COLUMN properties.workflow_status IS
  'Editorial workflow state (draft/published/passive/archived). Source of truth; is_active is kept in sync via trigger. Business state (sold/rented/etc.) lives in status column.';
