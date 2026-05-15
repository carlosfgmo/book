-- ============================================================
-- ACHACHAW BOOKS - Migración v3: correcciones de seguridad
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- FIX 1: "Public Bucket Allows Listing" en storage.covers
-- El bucket es público → los archivos se sirven por URL directa sin necesitar policy.
-- Eliminar el SELECT amplio que permite listar TODOS los archivos del bucket.
DROP POLICY IF EXISTS "covers: lectura pública" ON storage.objects;

-- FIX 2 y 3: "Public/Signed-In Can Execute SECURITY DEFINER" en handle_new_user()
-- Esta función solo debe ser invocada por el trigger on_auth_user_created (como postgres),
-- nunca directamente por usuarios anónimos o autenticados.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Hacer buyer_id opcional
ALTER TABLE "order" ALTER COLUMN buyer_id DROP NOT NULL;

-- Campos de contacto y entrega
ALTER TABLE "order"
  ADD COLUMN IF NOT EXISTS buyer_email       text,
  ADD COLUMN IF NOT EXISTS buyer_phone       text,
  ADD COLUMN IF NOT EXISTS buyer_whatsapp    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_delivery_method text DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS physical_address  text;

-- Vincular órdenes anónimas al registrarse
CREATE OR REPLACE FUNCTION public.link_anonymous_orders()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.order
  SET buyer_id = NEW.id
  WHERE buyer_email = NEW.email AND buyer_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_registered ON auth.users;
CREATE TRIGGER on_auth_user_registered
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_anonymous_orders();

ALTER TABLE payment ALTER COLUMN operation_number DROP NOT NULL;
