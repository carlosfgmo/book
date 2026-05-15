import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import CheckoutForm from './CheckoutForm'

const deliveryLabel: Record<string, string> = {
  pdf:      'PDF',
  physical: 'Libro físico',
  both:     'PDF + Físico',
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase    = await createClient()
  const admin       = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  // Only treat as "real" user if they have an email (ignore Supabase anonymous sessions)
  const realUserId = user?.email ? user.id : null

  const [{ data: order }, { data: orderItems }, { data: payment }] = await Promise.all([
    admin.from('order').select('id, total, buyer_id').eq('id', orderId).single(),
    admin.from('order_item').select('id, unit_price, book_id').eq('order_id', orderId),
    admin.from('payment').select('id').eq('order_id', orderId).single(),
  ])

  if (!order) notFound()

  // If order belongs to a registered user, require them to be logged in as that user
  if (order.buyer_id && order.buyer_id !== realUserId) {
    redirect(`/login?next=/checkout/${orderId}`)
  }

  if (payment) redirect(`/pedidos/${orderId}`)

  const bookIds = (orderItems ?? []).map((i: any) => i.book_id).filter(Boolean)

  const { data: books } = bookIds.length > 0
    ? await supabase.from('book').select('id, title, cover_url, delivery_type').in('id', bookIds)
    : { data: [] }

  const booksMap: Record<string, any> =
    Object.fromEntries((books ?? []).map((b: any) => [b.id, b]))

  const bookLines = (orderItems ?? []).map((item: any) => ({
    id:           item.id,
    title:        booksMap[item.book_id]?.title        ?? 'Libro',
    cover_url:    booksMap[item.book_id]?.cover_url    ?? null,
    delivery:     deliveryLabel[booksMap[item.book_id]?.delivery_type ?? 'pdf'],
    deliveryType: (booksMap[item.book_id]?.delivery_type ?? 'pdf') as string,
    price:        Number(item.unit_price),
  }))

  // Pre-fill contact info for registered users
  let userEmail = realUserId ? (user?.email ?? '') : ''
  let userPhone = ''
  if (realUserId) {
    const { data: profile } = await supabase
      .from('user')
      .select('phone')
      .eq('id', realUserId)
      .single()
    userPhone = profile?.phone ?? ''
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Completar pago</h1>
      <CheckoutForm
        orderId={orderId}
        total={Number(order.total)}
        bookLines={bookLines}
        userEmail={userEmail}
        userPhone={userPhone}
        isAuthenticated={!!realUserId}
      />
    </main>
  )
}
