-- 009: Add daily_rental to transaction_type_enum
ALTER TYPE transaction_type_enum ADD VALUE IF NOT EXISTS 'daily_rental';
