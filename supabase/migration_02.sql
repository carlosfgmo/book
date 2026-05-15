-- ============================================================
-- ACHACHAW BOOKS - Migración v2
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Preferencia de entrega del escritor
ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS delivery_preference public.delivery_mode NOT NULL DEFAULT 'platform';

-- 2. Actualizar trigger para soportar registro de escritor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public."user" (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN (NEW.raw_user_meta_data->>'is_writer')::boolean = true
        THEN ARRAY['reader','writer']::public.user_role[]
      ELSE ARRAY['reader']::public.user_role[]
    END
  );
  RETURN NEW;
END;
$$;

-- 3. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('covers',   'covers',   true)  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs',     'pdfs',     false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('vouchers', 'vouchers', false) ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies
CREATE POLICY "covers: lectura pública"
  ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "covers: escritor sube"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "pdfs: escritor sube"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND auth.role() = 'authenticated');
CREATE POLICY "pdfs: comprador con token"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'pdfs' AND EXISTS (
      SELECT 1 FROM public.order_item oi
      JOIN public."order" o ON o.id = oi.order_id
      WHERE o.buyer_id = auth.uid() AND oi.delivery_status = 'delivered'
    )
  );

CREATE POLICY "vouchers: comprador sube"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vouchers' AND auth.role() = 'authenticated');
CREATE POLICY "vouchers: admin lee"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'vouchers' AND EXISTS (
      SELECT 1 FROM public."user" WHERE id = auth.uid() AND 'admin'::public.user_role = ANY(role)
    )
  );
