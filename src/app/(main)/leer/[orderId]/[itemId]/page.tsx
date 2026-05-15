import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import PdfReader from './PdfReader'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function LeerPage({
  params,
}: {
  params: Promise<{ orderId: string; itemId: string }>
}) {
  const { orderId, itemId } = await params

  if (!UUID_RE.test(orderId) || !UUID_RE.test(itemId)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect(`/login?next=/leer/${orderId}/${itemId}`)

  const admin = createAdminClient()

  const { data: order } = await admin
    .from('order')
    .select('buyer_id, status')
    .eq('id', orderId)
    .single()

  if (!order || order.buyer_id !== user.id) notFound()

  if (order.status !== 'completed' && order.status !== 'processing') {
    redirect(`/pedidos/${orderId}`)
  }

  const { data: item } = await admin
    .from('order_item')
    .select('id, book(title, delivery_type, pdf_url)')
    .eq('id', itemId)
    .eq('order_id', orderId)
    .single()

  if (!item) notFound()

  const book = Array.isArray(item.book) ? item.book[0] : item.book as any

  if (!book?.pdf_url || (book.delivery_type !== 'pdf' && book.delivery_type !== 'both')) {
    redirect(`/pedidos/${orderId}`)
  }

  const pdfProxyUrl = `/api/leer/${orderId}/${itemId}`

  return <PdfReader url={pdfProxyUrl} title={book.title} />
}
