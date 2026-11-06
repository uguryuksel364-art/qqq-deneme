/*
# Create videos table for background video management

1. New Tables
- `videos`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `url` (text, not null)
  - `thumbnail_url` (text)
  - `format` (text) — 'horizontal' | 'vertical'
  - `duration` (text)
  - `file_size` (text)
  - `is_active` (integer, default 0)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `videos`.
- SELECT: allow anyone (anon) to read videos.
- INSERT / UPDATE / DELETE: restricted to authenticated (admin) only.
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  format text DEFAULT 'horizontal',
  duration text,
  file_size text,
  is_active integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to read videos
DROP POLICY IF EXISTS "allow_anon_read_videos" ON videos;
CREATE POLICY "allow_anon_read_videos"
ON videos FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can manage videos
DROP POLICY IF EXISTS "allow_auth_manage_videos" ON videos;
CREATE POLICY "allow_auth_manage_videos"
ON videos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
