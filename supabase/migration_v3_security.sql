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
