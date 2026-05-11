'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createBook(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const title = formData.get('title') as string
  const slug = (formData.get('slug') as string) || slugify(title)
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string || null
  const price = parseFloat(formData.get('price') as string)
  const presale_price = formData.get('presale_price') ? parseFloat(formData.get('presale_price') as string) : null
  const status = formData.get('status') as string
  const delivery_type = formData.get('delivery_type') as string
  const cover_url = formData.get('cover_url') as string || null
  const pdf_url = formData.get('pdf_url') as string || null
  const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
  const release_date = formData.get('release_date') as string || null

  const { error } = await supabase.from('book').insert({
    author_id: user.id,
    title,
    slug,
    description,
    category_id,
    price,
    presale_price,
    status,
    delivery_type,
    cover_url,
    pdf_url,
    stock,
    release_date: release_date || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/escritor')
  redirect('/dashboard/escritor')
}

export async function updateBook(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string || null
  const price = parseFloat(formData.get('price') as string)
  const presale_price = formData.get('presale_price') ? parseFloat(formData.get('presale_price') as string) : null
  const status = formData.get('status') as string
  const delivery_type = formData.get('delivery_type') as string
  const cover_url = formData.get('cover_url') as string || null
  const pdf_url = formData.get('pdf_url') as string || null
  const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
  const release_date = formData.get('release_date') as string || null

  const { error } = await supabase
    .from('book')
    .update({ title, description, category_id, price, presale_price, status, delivery_type, cover_url, pdf_url, stock, release_date: release_date || null })
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/escritor')
  redirect('/dashboard/escritor')
}

export async function updateOrderItemStatus(itemId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('order_item')
    .update({ delivery_status: status })
    .eq('id', itemId)

  revalidatePath('/dashboard/escritor/pedidos')
}

export async function reorderBooks(
  items: { id: string; sort_order: number }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase
        .from('book')
        .update({ sort_order })
        .eq('id', id)
        .eq('author_id', user.id)
    )
  )
}

export async function updateWriterProfile(
  _prev: { error?: string; success?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const delivery_preference = formData.get('delivery_preference') as string

  const { error } = await supabase
    .from('user')
    .update({ full_name, phone, address, delivery_preference })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/escritor/configuracion')
  return { success: 'Perfil actualizado correctamente.' }
}
