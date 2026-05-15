import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const { orderId, itemId } = await params

  if (!UUID_RE.test(orderId) || !UUID_RE.test(itemId)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return new NextResponse('Unauthorized', { status: 401 })

  const admin = createAdminClient()

  // Verify: order belongs to user + item belongs to order + book has PDF
  const { data: item } = await admin
    .from('order_item')
    .select('id, order_id, book(pdf_url, delivery_type)')
    .eq('id', itemId)
    .eq('order_id', orderId)
    .single()

  if (!item) return new NextResponse('Not found', { status: 404 })

  const { data: order } = await admin
    .from('order')
    .select('buyer_id, status')
    .eq('id', orderId)
    .single()

  if (!order || order.buyer_id !== user.id) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (order.status !== 'completed' && order.status !== 'processing') {
    return new NextResponse('Payment not verified', { status: 402 })
  }

  const book = Array.isArray(item.book) ? item.book[0] : item.book as any
  const pdfUrl: string | null = book?.pdf_url

  if (!pdfUrl) return new NextResponse('No PDF available', { status: 404 })

  // Fetch PDF server-side — never expose the storage URL to the client
  const upstream = await fetch(pdfUrl, { cache: 'no-store' })
  if (!upstream.ok) return new NextResponse('PDF unavailable', { status: 502 })

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  })
}
