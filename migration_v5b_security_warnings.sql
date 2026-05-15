-- ============================================================
-- migration_v5b_security_warnings.sql
-- Fixes warnings from Supabase Security Advisor
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. Move unaccent extension out of public schema
--       ("Extension in Public" warning)
-- ────────────────────────────────────────────────────────────
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;


-- ── 2. Fix link_anonymous_orders
--       Warnings: "Function Search Path Mutable" +
--                 "Public/Signed-In Can Execute SECURITY DEFINER"
--       This is a trigger function — users should NEVER call it directly.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.link_anonymous_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''           -- prevents search_path injection
AS $$
BEGIN
  UPDATE public."order"
  SET buyer_id = NEW.id
  WHERE buyer_email = NEW.email
    AND buyer_id IS NULL;
  RETURN NEW;
END;
$$;

-- Trigger functions are called by Postgres internals, not by users
REVOKE EXECUTE ON FUNCTION public.link_anonymous_orders() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.link_anonymous_orders() FROM anon;
REVOKE EXECUTE ON FUNCTION public.link_anonymous_orders() FROM authenticated;


-- ── 3. Fix search_books_unaccent
--       Warnings: "Function Search Path Mutable" +
--                 "Public/Signed-In Can Execute SECURITY DEFINER"
--       This function IS called by the app (public catalog search),
--       so anon + authenticated must keep EXECUTE permission.
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.search_books_unaccent(text);

CREATE OR REPLACE FUNCTION public.search_books_unaccent(q text)
RETURNS TABLE(id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''           -- prevents search_path injection
AS $$
DECLARE
  term text;
BEGIN
  -- Use extensions.unaccent (fully qualified — search_path is empty)
  term := '%' || extensions.unaccent(lower(q)) || '%';
  RETURN QUERY
    SELECT DISTINCT b.id
    FROM public.book b
    JOIN public."user" u ON u.id = b.author_id
    WHERE b.status IN ('published', 'presale')
      AND (
        extensions.unaccent(lower(b.title))        LIKE term
        OR extensions.unaccent(lower(u.full_name)) LIKE term
      );
END;
$$;

-- Revoke implicit PUBLIC grant, then grant explicitly only to the roles that need it
REVOKE EXECUTE ON FUNCTION public.search_books_unaccent(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.search_books_unaccent(text) TO anon, authenticated;
