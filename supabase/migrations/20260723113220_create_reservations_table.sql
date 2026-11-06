/*
# Create reservations table for yacht tour bookings

1. New Tables
- `reservations`
  - `id` (uuid, primary key)
  - `name` (text, not null) — customer's full name
  - `phone` (text, not null) — contact phone number
  - `email` (text, nullable) — optional contact email
  - `tour_date` (date, not null) — requested tour date
  - `tour_type` (text, not null) — 'full_day' | 'half_day'
  - `guests` (integer, not null, default 1) — number of guests
  - `notes` (text, nullable) — optional customer notes / requests
  - `status` (text, not null, default 'pending') — 'pending' | 'confirmed' | 'cancelled'
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `reservations`.
- INSERT: allow anon + authenticated (visitors submit bookings without signing in).
- SELECT / UPDATE / DELETE: restricted to authenticated (admin) only.
  The admin panel uses the service-role key server-side via an edge function,
  so RLS on these verbs is belt-and-suspenders for any direct authenticated access.

3. Important Notes
- This is a single-tenant booking system; the business owner is the only admin.
- Visitors never sign in — they submit the form anonymously.
- The admin authenticates via a simple password gate backed by an edge function
  that validates against a stored secret and returns reservations using the
  service-role key.
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  tour_date date NOT NULL,
  tour_type text NOT NULL CHECK (tour_type IN ('full_day', 'half_day')),
  guests integer NOT NULL DEFAULT 1 CHECK (guests >= 1 AND guests <= 50),
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reservations_created_at_desc_idx ON reservations (created_at DESC);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to create reservations
DROP POLICY IF EXISTS "anon_insert_reservations" ON reservations;
CREATE POLICY "anon_insert_reservations"
ON reservations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can read reservations (admin)
DROP POLICY IF EXISTS "auth_select_reservations" ON reservations;
CREATE POLICY "auth_select_reservations"
ON reservations FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update reservations (admin)
DROP POLICY IF EXISTS "auth_update_reservations" ON reservations;
CREATE POLICY "auth_update_reservations"
ON reservations FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- Only authenticated users can delete reservations (admin)
DROP POLICY IF EXISTS "auth_delete_reservations" ON reservations;
CREATE POLICY "auth_delete_reservations"
ON reservations FOR DELETE
TO authenticated
USING (true);
