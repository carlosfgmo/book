import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookForm from '../../../BookForm'

export default async function EditarLibroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: book }, { data: categories }, { data: profile }] = await Promise.all([
    supabase.from('book').select('*').eq('id', id).single(),
    supabase.from('category').select('id, name').order('name'),
    supabase.from('user').select('delivery_preference').eq('id', user!.id).single(),
  ])

  if (!book) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Editar libro</h1>
      <BookForm categories={categories ?? []} book={book} deliveryPreference={profile?.delivery_preference ?? 'platform'} />
    </div>
  )
}
