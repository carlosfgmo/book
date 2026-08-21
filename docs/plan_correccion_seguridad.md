# Plan de corrección de seguridad — Achachaw Books

> Generado a partir del informe `auditoria_seguridad_01.pdf` · Agosto 2026
> **9 hallazgos**: 1 crítico · 2 altos · 3 medios · 3 bajos

---

## Resumen de fases

| Fase | Plazo | Hallazgos | Criterio |
|------|-------|-----------|---------|
| **1 — Crítica** | Hoy mismo | H-01, H-03 | Exploits activos o sin ninguna defensa centralizada |
| **2 — Alta** | Esta semana | H-02 | Acceso directo a datos de pago vía cliente Supabase |
| **3 — Media** | Próximo sprint | H-04, H-05, H-06 | Manipulación de datos o spam posible |
| **4 — Backlog** | Cuando haya tiempo | H-07, H-08, H-09 | Sin explotación activa conocida |

---

## Fase 1 — Corrección crítica (hoy)

### H-01 · Manipulación de `order.status` sin restricción de campo

**Severidad**: CRÍTICO
**Problema**: La política RLS `"order: lector actualiza sus pedidos"` (migration_05.sql:37) permite
que cualquier usuario autenticado cambie `status`, `total` u otros campos sensibles de su propio
pedido usando el cliente Supabase con la anon key. El endpoint `/api/leer` no verifica
`delivery_status`, lo que permite leer PDFs sin pagar.

#### Tarea 1.1 — Eliminar la política UPDATE de `order` para usuarios normales

Todos los updates de pedidos ocurren vía `createAdminClient()` en Server Actions, por lo que
esta política no hace falta. Ejecutar en Supabase Dashboard → SQL Editor:

```sql
-- supabase/migration_11.sql
DROP POLICY IF EXISTS "order: lector actualiza sus pedidos" ON public."order";
```

> **Por qué es seguro eliminarla**: `submitPayment`, `deleteOrder` y `createOrder` usan
> `admin.from('order').update(...)` (bypassa RLS). Ningún Server Action usa el cliente con sesión
> de usuario para actualizar pedidos.

#### Tarea 1.2 — Añadir validación de `delivery_status` en el API route de PDF

**Archivo**: `src/app/api/leer/[orderId]/[itemId]/route.ts`

Después de la línea 41 (verificación de `order.buyer_id`), añadir:

```typescript
// Verificar que el ítem esté entregado (delivery_status = 'delivered')
// Esto impide acceder al PDF aunque el order.status sea manipulado
const book = Array.isArray(item.book) ? item.book[0] : item.book as any
if (!book) return new NextResponse('Not found', { status: 404 })

const { data: fullItem } = await admin
  .from('order_item')
  .select('delivery_status')
  .eq('id', itemId)
  .single()

if (fullItem?.delivery_status !== 'delivered') {
  return new NextResponse('Book not yet delivered', { status: 402 })
}
```

> Colocar este bloque entre la línea 41 (`if (!order || order.buyer_id !== user.id)`) y la línea 43
> (`if (order.status !== 'completed'...)`).

#### Tarea 1.3 — Añadir la misma validación en la página `/leer`

**Archivo**: `src/app/(main)/leer/[orderId]/[itemId]/page.tsx`

Después de la consulta de `item` (línea 35), antes de verificar `book.pdf_url`:

```typescript
const book = Array.isArray(item.book) ? item.book[0] : item.book as any

// Verificar entrega real del ítem
if (item.delivery_status !== 'delivered') {
  redirect(`/pedidos/${orderId}`)
}
```

> Nota: la consulta en línea 35 ya selecciona el item; añadir `delivery_status` al select:
> `.select('id, delivery_status, book(title, delivery_type, pdf_url)')`

#### Verificación de H-01

1. Crear un pedido nuevo → status queda `pending`.
2. Intentar via consola: `await supabase.from('order').update({ status: 'completed' }).eq('id', id)`
   → debe retornar error de RLS (política eliminada).
3. Visitar `/leer/{orderId}/{itemId}` con el pedido en `pending` → debe redirigir a `/pedidos/{orderId}`.

---

### H-03 · `proxy.ts` nunca se ejecuta — falta `middleware.ts`

**Severidad**: ALTO
**Problema**: Sin `middleware.ts`, el archivo `proxy.ts` es código muerto. No hay protección
centralizada de rutas en el edge de Next.js/Vercel.

#### Tarea 1.4 — Crear `src/middleware.ts`

```typescript
// src/middleware.ts
export { proxy as default, config } from './proxy'
```

> Eso es todo. Next.js detecta automáticamente `src/middleware.ts` y lo ejecuta en el edge según
> el `config.matcher` definido en `proxy.ts`.

#### Verificación de H-03

1. Abrir sesión en incógnito (sin login) y visitar `/dashboard` → debe redirigir a `/login`.
2. Visitar `/pedidos` sin login → debe redirigir a `/login?next=/pedidos`.
3. Confirmar en Vercel Logs que el middleware se ejecuta (aparece como "middleware" en los request logs).

---

## Fase 2 — Corrección alta (esta semana)

### H-02 · Storage RLS de PDFs otorga acceso cruzado entre libros

**Severidad**: ALTO
**Problema**: La política `"pdfs: comprador con token"` (migration_02.sql:43) autoriza acceso a
**cualquier** archivo del bucket `pdfs` para cualquier usuario con un pedido entregado, sin
verificar que el archivo sea el del libro comprado.

#### Tarea 2.1 — Revocar la política SELECT permisiva en el bucket `pdfs`

Todos los PDFs se sirven exclusivamente a través del API route `/api/leer`, que usa
`createAdminClient()` para la descarga y valida ownership correctamente. La política SELECT
del bucket no hace falta.

```sql
-- supabase/migration_11.sql (añadir a continuación de las tareas anteriores)
DROP POLICY IF EXISTS "pdfs: comprador con token" ON storage.objects;
```

> **Consecuencia**: el bucket `pdfs` queda sin política SELECT para usuarios. Supabase deniega
> acceso directo por defecto (el bucket ya es `public: false`). El API route no se ve afectado
> porque usa la service role key (bypassa RLS de storage).

#### Tarea 2.2 — Crear el archivo de migración SQL unificado

Crear `supabase/migration_11.sql` con todas las correcciones SQL de las fases 1 y 2:

```sql
-- ============================================================
-- migration_11.sql — Correcciones de seguridad (Auditoría 01)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- H-01: Eliminar política UPDATE demasiado permisiva en orders
DROP POLICY IF EXISTS "order: lector actualiza sus pedidos" ON public."order";

-- H-02: Eliminar política SELECT cruzada en bucket pdfs
DROP POLICY IF EXISTS "pdfs: comprador con token" ON storage.objects;

-- H-05: Habilitar RLS en tabla category
ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category: lectura pública"
  ON public.category FOR SELECT USING (true);

CREATE POLICY "category: solo admin modifica"
  ON public.category FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."user"
      WHERE id = auth.uid()
        AND 'admin'::public.user_role = ANY(role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."user"
      WHERE id = auth.uid()
        AND 'admin'::public.user_role = ANY(role)
    )
  );
```

#### Verificación de H-02

1. Con usuario que tiene un pedido `delivered`, ejecutar en consola:
   `await supabase.storage.from('pdfs').download('ruta/de/otro/libro.pdf')`
   → debe retornar error 400/403 (sin política SELECT, acceso denegado).
2. Visitar `/leer/{orderId}/{itemId}` con pedido pagado y entregado → PDF carga normalmente
   (el API route con admin client sigue funcionando).

---

## Fase 3 — Corrección media (próximo sprint)

### H-04 · Monto del pago no re-validado contra la BD

**Severidad**: MEDIO
**Problema**: `submitPayment` usa el campo `amount` enviado por el cliente (hidden input) sin
compararlo con `order.total` en la base de datos.

#### Tarea 3.1 — Leer el total desde la BD en `submitPayment`

**Archivo**: `src/app/(main)/actions.ts` — función `submitPayment`

Después de la verificación de `existingOrder` (línea 90), añadir:

```typescript
// Leer el total real del pedido desde la BD — ignorar el amount del cliente
const { data: orderWithTotal } = await admin
  .from('order')
  .select('total')
  .eq('id', orderId)
  .single()

const verifiedAmount = Number(orderWithTotal?.total ?? 0)
if (verifiedAmount <= 0) return { error: 'No se pudo verificar el monto del pedido.' }
```

Y en el INSERT de payment, reemplazar `amount: parseFloat(amount)` por `amount: verifiedAmount`:

```typescript
await admin.from('payment').insert({
  order_id: orderId,
  method,
  amount: verifiedAmount,   // ← BD, no cliente
  operation_number: operationNumber,
  voucher_url: voucherUrl,
  status: 'pending',
})
```

#### Verificación de H-04

1. Modificar el hidden input de `amount` a `0.01` en DevTools.
2. Enviar el formulario de checkout.
3. En Supabase → tabla `payment`, verificar que `amount` refleja el valor real del pedido, no `0.01`.

---

### H-05 · Tabla `category` sin Row Level Security

**Severidad**: MEDIO
**Problema**: Cualquier usuario anónimo puede insertar, modificar y eliminar categorías.

> **Acción**: ya incluida en el SQL de `migration_11.sql` (Tarea 2.2). Solo ejecutar la migración.

#### Verificación de H-05

```javascript
// Sin sesión (anon):
await supabase.from('category').insert({ name: 'Test', slug: 'test' })
// → debe retornar error 403 (new row violates row-level security policy)

// Con sesión de lector:
await supabase.from('category').delete().eq('slug', 'test')
// → debe retornar error 403
```

---

### H-06 · Trigger `link_anonymous_orders` permite spam de órdenes por email

**Severidad**: MEDIO
**Problema**: Cualquier visitante puede crear pedidos anónimos con el email de otra persona.
Al registrarse, esos pedidos se vinculan automáticamente a su cuenta.

#### Tarea 3.2 — Limitar creación de pedidos anónimos por email

**Archivo**: `src/app/(main)/actions.ts` — función `createOrder`

Después de verificar que el usuario no está autenticado (`realUserId === null`), añadir una
verificación de pedidos pendientes recientes para ese email (si lo proveen en este punto) o,
más efectivamente, limitar en `submitPayment`:

```typescript
// En submitPayment, antes del INSERT de payment:
// Verificar que no existan más de 5 pedidos pendientes con el mismo buyer_email
const { count: pendingCount } = await admin
  .from('order')
  .select('id', { count: 'exact', head: true })
  .eq('buyer_email', buyerEmail)
  .eq('status', 'pending')
  .is('buyer_id', null)

if ((pendingCount ?? 0) >= 5) {
  return { error: 'Demasiados pedidos pendientes con este correo. Completa o cancela los anteriores.' }
}
```

> Esto limita a 5 el número de pedidos anónimos `pending` por email antes de que el usuario
> los asocie a una cuenta. El límite puede ajustarse (1–3 es más restrictivo).

#### Verificación de H-06

1. Crear 6 pedidos anónimos seguidos con el mismo email.
2. El sexto debe ser rechazado con el mensaje de error.

---

## Fase 4 — Backlog (cuando haya disponibilidad)

### H-07 · CSP con `unsafe-inline` y `unsafe-eval`

**Severidad**: BAJO
**Problema**: El Content Security Policy en `next.config.ts:14` incluye `'unsafe-inline'` y
`'unsafe-eval'` en `script-src`, neutralizando la protección XSS de la CSP.

#### Tarea 4.1 — Implementar CSP con nonce en Next.js

**Archivo**: `src/middleware.ts` (el nuevo, creado en tarea 1.4) y `next.config.ts`

Next.js 15 soporta CSP con nonce nativo. El nonce se genera por request en el middleware
y se pasa como header, que Next.js inyecta automáticamente en los scripts inline del framework.

```typescript
// Añadir en src/middleware.ts, antes del return:
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Generar nonce criptográfico por request
const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

// Reemplazar en next.config.ts:
`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
```

> Referencia: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

---

### H-08 · Host header injection en reset de contraseña

**Severidad**: BAJO
**Problema**: `forgotPassword` construye el `redirectTo` desde el header `host`, lo que en
entornos sin proxy confiable permite spoofing del dominio en el email de reset.

#### Tarea 4.2 — Usar `NEXT_PUBLIC_SITE_URL` fija

**Archivo**: `src/app/(auth)/actions.ts` — función `forgotPassword`

Reemplazar las líneas 66–69:

```typescript
// Antes:
const headersList = await headers()
const host  = headersList.get('host') ?? 'localhost:3000'
const proto = headersList.get('x-forwarded-proto') ?? 'http'
const origin = `${proto}://${host}`

// Después:
const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
```

Añadir la variable en Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SITE_URL = https://achachaw.vercel.app
```

---

### H-09 · Ruta `/api/download/[token]` referenciada pero no implementada

**Severidad**: BAJO
**Opciones**:

**Opción A (recomendada si no se necesita)** — Eliminar el bloque de código muerto:

**Archivo**: `src/app/(main)/pedidos/[orderId]/page.tsx` — líneas 86–92

Eliminar el bloque:
```typescript
{item.download_token && (
  <a href={`/api/download/${item.download_token}`}>
    Descargar PDF
  </a>
)}
```

**Opción B (si se quiere implementar)** — Crear `src/app/api/download/[token]/route.ts` con:
- Búsqueda del token en `order_item.download_token`
- Verificación de expiración (`token_expires_at`)
- Invalidar el token tras el primer uso (set `download_token = NULL`)
- Descarga del PDF con `createAdminClient()`
- Headers: `Content-Disposition: attachment`, `Cache-Control: private, no-store`

---

## Checklist de ejecución

### Fase 1 — Hoy
- [ ] **T1.1** Ejecutar `DROP POLICY "order: lector actualiza sus pedidos"` en Supabase SQL Editor
- [ ] **T1.2** Añadir check de `delivery_status` en `src/app/api/leer/[orderId]/[itemId]/route.ts`
- [ ] **T1.3** Añadir check de `delivery_status` en `src/app/(main)/leer/[orderId]/[itemId]/page.tsx`
- [ ] **T1.4** Crear `src/middleware.ts` con re-export de `proxy.ts`
- [ ] Verificar en Vercel Logs que el middleware está activo
- [ ] Verificar que `/dashboard` sin login redirige correctamente

### Fase 2 — Esta semana
- [ ] **T2.1** Crear `supabase/migration_11.sql` con los drops de políticas + RLS de category
- [ ] Ejecutar `migration_11.sql` en Supabase SQL Editor
- [ ] Confirmar que `/api/leer` sigue sirviendo PDFs para pedidos válidos
- [ ] Confirmar que acceso directo al bucket `pdfs` es denegado

### Fase 3 — Próximo sprint
- [ ] **T3.1** Reemplazar `amount: parseFloat(amount)` por `amount: verifiedAmount` en `submitPayment`
- [ ] **T3.2** Añadir límite de pedidos anónimos por email en `submitPayment`
- [ ] Probar el flujo completo de checkout con pedido pagado y rechazado

### Fase 4 — Backlog
- [ ] **T4.1** Implementar CSP con nonce en middleware + next.config.ts
- [ ] **T4.2** Añadir `NEXT_PUBLIC_SITE_URL` en Vercel y actualizar `forgotPassword`
- [ ] **T4.3** Decidir y ejecutar opción A u opción B para `download_token`

---

## Orden de ejecución sugerido en una sola sesión

Si se quiere corregir todo de una vez, este es el orden seguro (sin romper nada):

1. `migration_11.sql` en Supabase (SQL puro, sin tocar código)
2. `src/middleware.ts` (crear archivo nuevo, sin modificar nada existente)
3. `src/app/api/leer/[orderId]/[itemId]/route.ts` (añadir check delivery_status)
4. `src/app/(main)/leer/[orderId]/[itemId]/page.tsx` (añadir check delivery_status)
5. `src/app/(main)/actions.ts` (dos cambios: amount desde BD + límite anónimos)
6. `src/app/(auth)/actions.ts` (origin desde env var)
7. `next.config.ts` (CSP con nonce — requiere coordinación con middleware)
8. `src/app/(main)/pedidos/[orderId]/page.tsx` (eliminar bloque download_token)

---

*Informe base*: `docs/auditoria_seguridad_01.pdf`
*Próxima revisión*: después de completar Fase 1 y Fase 2
