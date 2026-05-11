-- ============================================================
-- ACHACHAW BOOKS - Migración inicial
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tipos ENUM
CREATE TYPE public.user_role        AS ENUM ('reader', 'writer', 'admin');
CREATE TYPE public.book_status      AS ENUM ('draft', 'presale', 'published', 'archived');
CREATE TYPE public.delivery_type    AS ENUM ('pdf', 'physical', 'both');
CREATE TYPE public.order_status     AS ENUM ('pending', 'paid', 'processing', 'completed', 'cancelled');
CREATE TYPE public.delivery_mode    AS ENUM ('platform', 'direct');
CREATE TYPE public.item_del_status  AS ENUM ('pending', 'processing', 'delivered', 'failed');
CREATE TYPE public.payment_method   AS ENUM ('yape', 'plin', 'bank_transfer');
CREATE TYPE public.payment_status   AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.conv_type        AS ENUM ('presale', 'support', 'general');
CREATE TYPE public.attach_type      AS ENUM ('image', 'document', 'audio');

-- ============================================================
-- NÚCLEO DEL NEGOCIO
-- ============================================================

CREATE TABLE public."user" (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        UNIQUE NOT NULL,
  full_name   text        NOT NULL DEFAULT '',
  avatar_url  text,
  role        public.user_role[]  DEFAULT ARRAY['reader'::public.user_role],
  phone       text,
  address     text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.category (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text  NOT NULL,
  slug        text  UNIQUE NOT NULL,
  description text,
  parent_id   uuid  REFERENCES public.category(id) ON DELETE SET NULL
);

CREATE TABLE public.book (
  id             uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      uuid                  NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  category_id    uuid                  REFERENCES public.category(id) ON DELETE SET NULL,
  title          text                  NOT NULL,
  slug           text                  UNIQUE NOT NULL,
  description    text                  NOT NULL DEFAULT '',
  price          numeric(10,2)         NOT NULL,
  presale_price  numeric(10,2),
  status         public.book_status    NOT NULL DEFAULT 'draft',
  delivery_type  public.delivery_type  NOT NULL,
  cover_url      text,
  pdf_url        text,
  stock          integer,
  release_date   date,
  created_at     timestamptz           DEFAULT now()
);

CREATE TABLE public."order" (
  id               uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id         uuid                  NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  status           public.order_status   NOT NULL DEFAULT 'pending',
  total            numeric(10,2)         NOT NULL,
  shipping_address text,
  delivery_mode    public.delivery_mode  NOT NULL,
  created_at       timestamptz           DEFAULT now()
);

CREATE TABLE public.order_item (
  id               uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid                    NOT NULL REFERENCES public."order"(id) ON DELETE CASCADE,
  book_id          uuid                    NOT NULL REFERENCES public.book(id) ON DELETE RESTRICT,
  quantity         integer                 NOT NULL DEFAULT 1,
  unit_price       numeric(10,2)           NOT NULL,
  delivery_status  public.item_del_status  NOT NULL DEFAULT 'pending',
  download_token   text,
  token_expires_at timestamptz
);

CREATE TABLE public.payment (
  id               uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid                   UNIQUE NOT NULL REFERENCES public."order"(id) ON DELETE CASCADE,
  method           public.payment_method  NOT NULL,
  amount           numeric(10,2)          NOT NULL,
  operation_number text                   NOT NULL,
  voucher_url      text,
  status           public.payment_status  NOT NULL DEFAULT 'pending',
  verified_by      uuid                   REFERENCES public."user"(id) ON DELETE SET NULL,
  verified_at      timestamptz,
  created_at       timestamptz            DEFAULT now()
);

-- ============================================================
-- MÓDULO SOCIAL
-- ============================================================

CREATE TABLE public.comment (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id              uuid        NOT NULL REFERENCES public.book(id) ON DELETE CASCADE,
  user_id              uuid        NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  parent_id            uuid        REFERENCES public.comment(id) ON DELETE CASCADE,
  rating               smallint    CHECK (rating BETWEEN 1 AND 5),
  content              text        NOT NULL,
  is_verified_purchase boolean     NOT NULL DEFAULT false,
  is_visible           boolean     NOT NULL DEFAULT true,
  created_at           timestamptz DEFAULT now()
);

CREATE VIEW public.book_rating AS
SELECT
  book_id,
  ROUND(AVG(rating), 1)                              AS avg_rating,
  COUNT(*) FILTER (WHERE rating IS NOT NULL)         AS total_ratings,
  COUNT(*)                                            AS total_comments
FROM public.comment
WHERE is_visible = true
GROUP BY book_id;

ALTER VIEW public.book_rating SET (security_invoker = true);

CREATE TABLE public.conversation (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id         uuid              NOT NULL REFERENCES public.book(id) ON DELETE CASCADE,
  reader_id       uuid              NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  writer_id       uuid              NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  type            public.conv_type  NOT NULL DEFAULT 'general',
  last_message_at timestamptz,
  created_at      timestamptz       DEFAULT now()
);

CREATE TABLE public.message (
  id              uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid                 NOT NULL REFERENCES public.conversation(id) ON DELETE CASCADE,
  sender_id       uuid                 NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  content         text,
  attachment_url  text,
  attachment_type public.attach_type,
  is_read         boolean              NOT NULL DEFAULT false,
  read_at         timestamptz,
  created_at      timestamptz          DEFAULT now(),
  CONSTRAINT message_has_content CHECK (content IS NOT NULL OR attachment_url IS NOT NULL)
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_book_author       ON public.book(author_id);
CREATE INDEX idx_book_status       ON public.book(status);
CREATE INDEX idx_book_category     ON public.book(category_id);
CREATE INDEX idx_order_buyer       ON public."order"(buyer_id);
CREATE INDEX idx_order_item_order  ON public.order_item(order_id);
CREATE INDEX idx_payment_order     ON public.payment(order_id);
CREATE INDEX idx_payment_status    ON public.payment(status);
CREATE INDEX idx_comment_book      ON public.comment(book_id);
CREATE INDEX idx_conv_reader       ON public.conversation(reader_id);
CREATE INDEX idx_conv_writer       ON public.conversation(writer_id);
CREATE INDEX idx_message_conv      ON public.message(conversation_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public."user"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."order"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message       ENABLE ROW LEVEL SECURITY;

-- user
CREATE POLICY "user: ver propio perfil"
  ON public."user" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user: ver perfil de escritores"
  ON public."user" FOR SELECT
  USING ('writer'::public.user_role = ANY(role) OR 'admin'::public.user_role = ANY(role));
CREATE POLICY "user: editar propio perfil"
  ON public."user" FOR UPDATE USING (auth.uid() = id);

-- book
CREATE POLICY "book: lectores ven publicados"
  ON public.book FOR SELECT
  USING (status IN ('published', 'presale'));
CREATE POLICY "book: escritor ve sus libros"
  ON public.book FOR SELECT
  USING (auth.uid() = author_id);
CREATE POLICY "book: escritor crea libros"
  ON public.book FOR INSERT
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "book: escritor edita sus libros"
  ON public.book FOR UPDATE
  USING (auth.uid() = author_id);

-- order
CREATE POLICY "order: lector ve sus pedidos"
  ON public."order" FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "order: lector crea pedidos"
  ON public."order" FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- order_item
CREATE POLICY "order_item: comprador ve sus items"
  ON public.order_item FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public."order" o
    WHERE o.id = order_item.order_id AND o.buyer_id = auth.uid()
  ));

-- payment
CREATE POLICY "payment: comprador ve sus pagos"
  ON public.payment FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public."order" o
    WHERE o.id = payment.order_id AND o.buyer_id = auth.uid()
  ));
CREATE POLICY "payment: comprador registra pago"
  ON public.payment FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public."order" o
    WHERE o.id = payment.order_id AND o.buyer_id = auth.uid()
  ));
CREATE POLICY "payment: solo admin aprueba"
  ON public.payment FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.id = auth.uid() AND 'admin'::public.user_role = ANY(u.role)
  ));

-- comment
CREATE POLICY "comment: ver comentarios visibles"
  ON public.comment FOR SELECT USING (is_visible = true);
CREATE POLICY "comment: autenticado puede comentar"
  ON public.comment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment: editar propio comentario"
  ON public.comment FOR UPDATE USING (auth.uid() = user_id);

-- conversation
CREATE POLICY "conv: participantes ven sus conversaciones"
  ON public.conversation FOR SELECT
  USING (auth.uid() = reader_id OR auth.uid() = writer_id);
CREATE POLICY "conv: lector crea conversación"
  ON public.conversation FOR INSERT WITH CHECK (auth.uid() = reader_id);

-- message
CREATE POLICY "msg: participantes ven mensajes"
  ON public.message FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversation c
    WHERE c.id = message.conversation_id
      AND (c.reader_id = auth.uid() OR c.writer_id = auth.uid())
  ));
CREATE POLICY "msg: participantes envían mensajes"
  ON public.message FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation c
      WHERE c.id = message.conversation_id
        AND (c.reader_id = auth.uid() OR c.writer_id = auth.uid())
    )
  );

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public."user" (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- POST-REGISTRO: promover usuario "roax" a admin
-- Ejecutar DESPUÉS de que "roax" se haya registrado en la app
-- ============================================================

-- UPDATE public."user"
-- SET role = ARRAY['reader','writer','admin']::public.user_role[]
-- WHERE email = 'roax@tudominio.com';  -- reemplazar con el email real de roax
