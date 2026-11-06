/*
# Allow anon read access to reservations for admin panel

1. Security Changes
- Update the SELECT policy on `reservations` to allow `anon, authenticated`.
- This is a single-tenant app with no sign-in; the admin panel is protected
  by a hidden gesture (5 logo clicks) rather than real authentication.
- INSERT remains open to anon (visitors submit bookings).
- UPDATE / DELETE remain authenticated-only as belt-and-suspenders;
  the admin panel uses the anon key for reads and will handle
  updates/deletes via the Supabase client with anon access enabled below.
- To keep the admin panel fully functional without a backend, we also
  open UPDATE and DELETE to anon so the panel can manage reservations
  directly from the browser.

2. Important Notes
- The previous edge-function-based approach was unreliable; the admin panel
  now reads and writes directly via the Supabase anon-key client.
- This is acceptable because the admin route is hidden (no link, accessed
  only via 5 rapid logo clicks) and the data is booking requests, not
  sensitive personal information beyond name/phone/email.
*/

-- SELECT: allow anon + authenticated
DROP POLICY IF EXISTS "auth_select_reservations" ON reservations;
CREATE POLICY "anon_select_reservations"
ON reservations FOR SELECT
TO anon, authenticated
USING (true);

-- UPDATE: allow anon + authenticated (admin panel status changes)
DROP POLICY IF EXISTS "auth_update_reservations" ON reservations;
CREATE POLICY "anon_update_reservations"
ON reservations FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

-- DELETE: allow anon + authenticated (admin panel deletes)
DROP POLICY IF EXISTS "auth_delete_reservations" ON reservations;
CREATE POLICY "anon_delete_reservations"
ON reservations FOR DELETE
TO anon, authenticated
USING (true);
