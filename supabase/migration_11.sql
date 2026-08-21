-- ============================================================
-- ACHACHAW BOOKS - Migración v11: correcciones de seguridad
-- Auditoría 01 - Agosto 2026
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── H-01: Eliminar política UPDATE sin restricción de campos en order
--    Todos los updates de pedidos ocurren vía createAdminClient() en
--    Server Actions, por lo que esta política no es necesaria y era
--    explotable para cambiar order.status sin pagar.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "order: lector actualiza sus pedidos" ON public."order";


-- ── H-02: Eliminar política SELECT cruzada en bucket pdfs
--    La política anterior permitía a cualquier usuario con UN pedido
--    entregado descargar CUALQUIER PDF del bucket. Todos los PDFs se
--    sirven exclusivamente a través de /api/leer (admin client), por
--    lo que esta política de storage no es necesaria.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pdfs: comprador con token" ON storage.objects;


-- ── H-05: Habilitar RLS en tabla category
--    Sin RLS, cualquier usuario anónimo podía insertar, modificar y
--    eliminar categorías directamente via el cliente Supabase.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category: lectura pública"
  ON public.category FOR SELECT USING (true);

CREATE POLICY "category: solo admin modifica"
  ON public.category FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."user"
      WHERE id = auth.uid()
        AND 'admin'::public.user_role = ANY(role)
    )
  );

CREATE POLICY "category: solo admin actualiza"
  ON public.category FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."user"
      WHERE id = auth.uid()
        AND 'admin'::public.user_role = ANY(role)
    )
  );

CREATE POLICY "category: solo admin elimina"
  ON public.category FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."user"
      WHERE id = auth.uid()
        AND 'admin'::public.user_role = ANY(role)
    )
  );
