-- ============================================================================
-- GamersNest — Recreate Admin Authorization (admin_profiles only)
-- ============================================================================
-- CONTEXT: Only the admin_profiles table was deleted and the auth user was
-- recreated. The bookings table already exists and is LEFT UNTOUCHED here.
--
-- HOW TO RUN:
--   1. Open Supabase Dashboard -> SQL Editor -> New query.
--   2. Paste this ENTIRE script and click RUN.
--   The final SELECT should return: gamersnest05@gmail.com | admin
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Admin profiles table (authorization / role mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name       TEXT,
    role       TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 2. is_admin() — returns true if the current authenticated user is an admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;


-- ----------------------------------------------------------------------------
-- 3. RLS on admin_profiles: only admins may read
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());


-- ----------------------------------------------------------------------------
-- 4. RLS on bookings (re-assert; harmless if already configured)
-- ----------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Base table GRANTs — required IN ADDITION to RLS policies. Without these,
-- Postgres denies access before RLS is evaluated ("permission denied for table").
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon;

-- Protect customer PII from anonymous reads (revoke read only, keep insert grant above)
REVOKE SELECT ON public.bookings FROM anon;

DROP POLICY IF EXISTS "Allow public insert for bookings" ON public.bookings;
CREATE POLICY "Allow public insert for bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;
CREATE POLICY "Admins have full access to bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ----------------------------------------------------------------------------
-- 5. delete_all_bookings_admin() — safe bulk clear, admin-only
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_all_bookings_admin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Only authorized GamersNest admins can clear booking data.';
    END IF;

    DELETE FROM public.bookings WHERE true;

    RETURN jsonb_build_object(
        'ok', true,
        'message', 'All booking data has been permanently cleared.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_all_bookings_admin() TO authenticated;


-- ============================================================================
-- 6. LINK YOUR (RECREATED) ADMIN USER
-- ============================================================================
-- Auto-detects the user id by email, so the new user id is picked up correctly.
INSERT INTO public.admin_profiles (user_id, name, role)
SELECT id, 'GamersNest Owner', 'admin'
FROM auth.users
WHERE email = 'gamersnest05@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';


-- ----------------------------------------------------------------------------
-- 7. VERIFY — should return exactly one row: gamersnest05@gmail.com | admin
-- ----------------------------------------------------------------------------
SELECT u.email, p.role, p.user_id
FROM public.admin_profiles p
JOIN auth.users u ON u.id = p.user_id;
-- ============================================================================
