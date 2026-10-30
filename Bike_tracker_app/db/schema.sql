-- Run once in Supabase SQL Editor. Creates the table only; no personal data lives in this repo.
-- The app creates the first (empty) row itself on first load.
CREATE TABLE IF NOT EXISTS app_data (
  id INT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
