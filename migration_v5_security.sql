-- ============================================================
-- migration_v5_security.sql
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Fix search_books_unaccent: use plpgsql to avoid direct
--       string concatenation (SQL injection hardening)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_books_unaccent(q text)
RETURNS TABLE(id uuid)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  term text;
BEGIN
  term := '%' || unaccent(lower(q)) || '%';
  RETURN QUERY
    SELECT DISTINCT b.id
    FROM book b
    JOIN "user" u ON u.id = b.author_id
    WHERE b.status IN ('published', 'presale')
      AND (
        unaccent(lower(b.title))        LIKE term
        OR unaccent(lower(u.full_name)) LIKE term
      );
END;
$$;

-- ── 2. RLS: add DELETE policy on order (only owner, only pending)
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'order' AND policyname = 'order: lector elimina sus pedidos pendientes'
  ) THEN
    CREATE POLICY "order: lector elimina sus pedidos pendientes"
      ON public."order" FOR DELETE
      USING (auth.uid() = buyer_id AND status = 'pending');
  END IF;
END$$;

-- ── 3. RLS: add UPDATE policy on order (only own rows)
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'order' AND policyname = 'order: lector actualiza sus pedidos'
  ) THEN
    CREATE POLICY "order: lector actualiza sus pedidos"
      ON public."order" FOR UPDATE
      USING (auth.uid() = buyer_id)
      WITH CHECK (auth.uid() = buyer_id);
  END IF;
END$$;

-- ── 4. RLS: prevent anonymous orders from being read by
--       other authenticated users (SELECT on anon orders)
-- ────────────────────────────────────────────────────────────
-- The existing policy "order: lector ve sus pedidos" already uses
-- auth.uid() = buyer_id, which correctly blocks other users from
-- reading NULL buyer_id rows. No change needed there.

-- ── 5. RLS: restrict payment table reads to order owner
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payment' AND policyname = 'payment: lector ve sus pagos'
  ) THEN
    CREATE POLICY "payment: lector ve sus pagos"
      ON public.payment FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public."order" o
          WHERE o.id = order_id AND o.buyer_id = auth.uid()
        )
      );
  END IF;
END$$;
