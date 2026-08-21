'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrder(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // No redirect — anonymous purchases allowed

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

  // Admin client for writes: handles both anonymous and authenticated
  const admin = createAdminClient()

  // Only link to a real registered user (not Supabase anonymous sessions)
  const realUserId = user?.email ? user.id : null

  const { data: order, error } = await admin
    .from('order')
    .insert({
      buyer_id: realUserId,
      status: 'pending',
      total: price,
      delivery_mode: writer?.delivery_preference ?? 'platform',
    })
    .select()
    .single()

  if (error || !order) throw new Error('Error al crear el pedido')

  await admin.from('order_item').insert({
    order_id: order.id,
    book_id: book.id,
    quantity: 1,
    unit_price: price,
    delivery_status: 'pending',
  })

  redirect(`/checkout/${order.id}`)
}

export async function submitPayment(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const orderId         = formData.get('order_id') as string
  const method          = formData.get('method') as string
  const operationNumber = (formData.get('operation_number') as string).trim() || null
  const voucherUrl      = formData.get('voucher_url') as string
  const amount          = formData.get('amount') as string
  const buyerEmail      = (formData.get('buyer_email') as string ?? '').trim()
  const buyerPhone      = (formData.get('buyer_phone') as string ?? '').trim()
  const buyerWhatsapp   = formData.get('buyer_whatsapp') === 'true'
  const pdfDelivery     = (formData.get('pdf_delivery_method') as string) || 'email'
  const physicalAddress = (formData.get('physical_address') as string ?? '').trim() || null

  if (!buyerEmail)  return { error: 'El correo electrónico es obligatorio.' }
  if (!buyerPhone)  return { error: 'El número de teléfono es obligatorio.' }
  if (!voucherUrl)  return { error: 'Debes subir la captura del comprobante.' }

  const admin = createAdminClient()

  // Verify order exists and ownership
  const { data: existingOrder } = await admin
    .from('order')
    .select('id, buyer_id, total')
    .eq('id', orderId)
    .single()

  if (!existingOrder) return { error: 'Pedido no encontrado.' }

  const realUserId = user?.email ? user.id : null
  if (existingOrder.buyer_id && existingOrder.buyer_id !== realUserId) {
    return { error: 'No autorizado.' }
  }

  // H-04 fix: use the amount stored in the DB — never trust the client-submitted value.
  const verifiedAmount = Number(existingOrder.total)
  if (verifiedAmount <= 0) return { error: 'No se pudo verificar el monto del pedido.' }

  // H-06 fix: limit anonymous pending orders per email to prevent spam.
  if (!existingOrder.buyer_id) {
    const { count: pendingCount } = await admin
      .from('order')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_email', buyerEmail)
      .eq('status', 'pending')
      .is('buyer_id', null)

    if ((pendingCount ?? 0) >= 5) {
      return { error: 'Hay demasiados pedidos pendientes con este correo. Completa o cancela los anteriores.' }
    }
  }

  // Update order with contact info
  // Also link to registered account if they're logged in and order was anonymous
  await admin.from('order').update({
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone,
    buyer_whatsapp: buyerWhatsapp,
    pdf_delivery_method: pdfDelivery,
    physical_address: physicalAddress,
    status: 'paid',
    ...(realUserId && !existingOrder.buyer_id ? { buyer_id: realUserId } : {}),
  }).eq('id', orderId)

  const { error } = await admin.from('payment').insert({
    order_id: orderId,
    method,
    amount: verifiedAmount,
    operation_number: operationNumber,
    voucher_url: voucherUrl,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath(`/checkout/${orderId}`)

  if (realUserId) redirect(`/pedidos/${orderId}`)
  return { success: true }
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para comentar' }

  const bookId   = formData.get('book_id') as string
  const content  = formData.get('content') as string
  const ratingRaw = formData.get('rating') as string
  const rating   = ratingRaw ? parseInt(ratingRaw) : null

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
