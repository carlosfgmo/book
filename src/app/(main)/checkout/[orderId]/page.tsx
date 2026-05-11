import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import CheckoutForm from './CheckoutForm'

const deliveryLabel: Record<string, string> = {
  pdf: 'PDF',
  physical: 'Libro físico',
  both: 'PDF + Físico',
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: order }, { data: payment }] = await Promise.all([
    supabase.from('order').select('id, total, buyer_id').eq('id', orderId).eq('buyer_id', user.id).single(),
    supabase.from('payment').select('id').eq('order_id', orderId).single(),
  ])

  if (!order) notFound()
  if (payment) redirect(`/pedidos/${orderId}`)

  // Admin client bypasses RLS on order_item
  const admin = createAdminClient()
  const { data: orderItems } = await admin
    .from('order_item')
    .select('id, unit_price, book_id')
    .eq('order_id', orderId)

  const bookIds = (orderItems ?? []).map((i: any) => i.book_id).filter(Boolean)

  const { data: books } = bookIds.length > 0
    ? await supabase.from('book').select('id, title, cover_url, delivery_type').in('id', bookIds)
    : { data: [] }

  const booksMap: Record<string, { title: string; cover_url: string | null; delivery_type: string }> =
    Object.fromEntries((books ?? []).map((b: any) => [b.id, b]))

  const bookLines = (orderItems ?? []).map((item: any) => ({
    id:        item.id,
    title:     booksMap[item.book_id]?.title        ?? 'Libro',
    cover_url: booksMap[item.book_id]?.cover_url    ?? null,
    delivery:  deliveryLabel[booksMap[item.book_id]?.delivery_type ?? 'pdf'],
    price:     Number(item.unit_price),
  }))

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Completar pago</h1>
      <CheckoutForm
        orderId={orderId}
        total={Number(order.total)}
        bookLines={bookLines}
      />
    </main>
  )
}
