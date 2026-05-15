import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file     = formData.get('file') as File | null
  const orderId  = formData.get('order_id') as string | null

  if (!file || !orderId) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })
  }

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${orderId}/${Date.now()}.${ext}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('vouchers')
    .upload(path, file, { contentType: file.type })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from('vouchers').getPublicUrl(data.path)
  return NextResponse.json({ url: urlData.publicUrl })
}
