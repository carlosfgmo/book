-- ============================================================
-- migration_v5c_security_invoker.sql
-- Fixes remaining 2 Security Advisor warnings on search_books_unaccent:
--   "Public Can Execute SECURITY DEFINER Function"
--   "Signed-In Users Can Execute SECURITY DEFINER Function"
--
-- Root cause: SECURITY DEFINER is unnecessary here.
-- The function only reads published/presale books and public author names,
-- both already accessible to anon via RLS. Switching to SECURITY INVOKER
-- (the default) eliminates the warnings without changing behavior.
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

DROP FUNCTION IF EXISTS public.search_books_unaccent(text);

CREATE OR REPLACE FUNCTION public.search_books_unaccent(q text)
RETURNS TABLE(id uuid)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER          -- runs with caller's permissions, RLS enforced
SET search_path = ''
AS $$
DECLARE
  term text;
BEGIN
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

GRANT EXECUTE ON FUNCTION public.search_books_unaccent(text) TO anon, authenticated;
