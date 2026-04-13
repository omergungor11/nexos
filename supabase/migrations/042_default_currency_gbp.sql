-- Default currency for new property listings is now GBP (sterlin) — the
-- primary currency used in Northern Cyprus real estate transactions.
-- Existing rows are untouched; only the column default changes.

ALTER TABLE properties
  ALTER COLUMN currency SET DEFAULT 'GBP';
