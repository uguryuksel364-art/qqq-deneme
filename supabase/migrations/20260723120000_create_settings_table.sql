/*
# Create settings table for global application configuration

1. New Tables
- `settings`
  - `key` (text, primary key) — unique identifier for the setting (e.g., 'page_settings', 'transfer_zones')
  - `value` (jsonb, not null) — JSON blob containing the settings object
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `settings`.
- SELECT: allow anyone (anon) to read settings.
- INSERT / UPDATE / DELETE: restricted to authenticated (admin) only.
*/

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to read settings
DROP POLICY IF EXISTS "allow_anon_read_settings" ON settings;
CREATE POLICY "allow_anon_read_settings"
ON settings FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can manage settings
DROP POLICY IF EXISTS "allow_auth_manage_settings" ON settings;
CREATE POLICY "allow_auth_manage_settings"
ON settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
