import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const ALLOWED_MIME  = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXT   = new Set(['jpg', 'jpeg', 'png', 'webp'])
const MAX_BYTES     = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  const formData = await request.formData()
  const file     = formData.get('file') as File | null
  const orderId  = formData.get('order_id') as string | null

  if (!file || !orderId) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })
  }

  // Validate MIME type (from Content-Type header, not user-controlled filename)
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP.' }, { status: 400 })
  }

  // Validate extension against whitelist
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: 'Extensión de archivo no permitida.' }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'El archivo no puede superar los 5 MB.' }, { status: 400 })
  }

  // Validate orderId is a UUID (prevents path traversal)
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(orderId)) {
    return NextResponse.json({ error: 'Orden inválida.' }, { status: 400 })
  }

  // Verify the order exists and the caller is allowed to upload for it
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('order')
    .select('id, buyer_id')
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 })
  }

  // If the order belongs to a registered user, require them to be logged in
  if (order.buyer_id) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const realUserId = user?.email ? user.id : null
    if (realUserId !== order.buyer_id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
    }
  }

  // Use a random UUID for the filename to prevent enumeration / overwrite
  const path = `${orderId}/${randomUUID()}.${ext}`

  const { data, error } = await admin.storage
    .from('vouchers')
    .upload(path, file, { contentType: file.type })

  if (error) {
    return NextResponse.json({ error: 'Error al subir el archivo.' }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from('vouchers').getPublicUrl(data.path)
  return NextResponse.json({ url: urlData.publicUrl })
}
