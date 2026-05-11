'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrder(bookId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: book } = await supabase
    .from('book')
    .select('id, price, presale_price, status, author_id, delivery_type')
    .eq('id', bookId)
    .single()

  if (!book) throw new Error('Libro no encontrado')

  const { data: writer } = await supabase
    .from('user')
    .select('delivery_preference')
    .eq('id', book.author_id)
    .single()

  const price =
    book.status === 'presale' && book.presale_price ? book.presale_price : book.price

  const { data: order, error } = await supabase
    .from('order')
    .insert({
      buyer_id: user.id,
      status: 'pending',
      total: price,
      delivery_mode: writer?.delivery_preference ?? 'platform',
    })
    .select()
    .single()

  if (error || !order) throw new Error('Error al crear el pedido')

  await supabase.from('order_item').insert({
    order_id: order.id,
    book_id: book.id,
    quantity: 1,
    unit_price: price,
    delivery_status: 'pending',
  })

  redirect(`/checkout/${order.id}`)
}

export async function submitPayment(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const orderId         = formData.get('order_id') as string
  const method          = formData.get('method') as string
  const operationNumber = (formData.get('operation_number') as string).trim() || null
  const voucherUrl      = formData.get('voucher_url') as string
  const amount          = formData.get('amount') as string

  if (!voucherUrl) return { error: 'Debes subir la captura del comprobante.' }

  const { error } = await supabase.from('payment').insert({
    order_id: orderId,
    method,
    amount: parseFloat(amount),
    operation_number: operationNumber,
    voucher_url: voucherUrl,
    status: 'pending',
  })

  if (error) return { error: error.message }

  await supabase.from('order').update({ status: 'paid' }).eq('id', orderId)

  revalidatePath(`/checkout/${orderId}`)
  redirect(`/pedidos/${orderId}`)
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Solo si el pedido pertenece al usuario y no tiene pago registrado
  const { data: order } = await supabase
    .from('order')
    .select('id, status, buyer_id')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single()

  if (!order || order.status !== 'pending') return { error: 'No se puede eliminar este pedido' }

  const { data: payment } = await supabase
    .from('payment')
    .select('id')
    .eq('order_id', orderId)
    .single()

  if (payment) return { error: 'Este pedido ya tiene un comprobante registrado' }

  const admin = createAdminClient()
  await admin.from('order_item').delete().eq('order_id', orderId)
  await admin.from('order').delete().eq('id', orderId)

  revalidatePath('/pedidos')
  redirect('/pedidos')
}

export async function addComment(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para comentar' }

  const bookId = formData.get('book_id') as string
  const content = formData.get('content') as string
  const ratingRaw = formData.get('rating') as string
  const rating = ratingRaw ? parseInt(ratingRaw) : null

  // Verificar si es compra verificada
  const { data: purchase } = await supabase
    .from('order_item')
    .select('id, order:order(buyer_id, status)')
    .eq('book_id', bookId)
    .limit(1)
    .single()

  const order = purchase?.order as { buyer_id: string; status: string } | null | any
  const isVerified =
    purchase &&
    order?.buyer_id === user.id &&
    order?.status === 'completed'

  const { error } = await supabase.from('comment').insert({
    book_id: bookId,
    user_id: user.id,
    content,
    rating,
    is_verified_purchase: !!isVerified,
  })

  if (error) return { error: error.message }

  revalidatePath(`/catalogo`)
  return null
}
