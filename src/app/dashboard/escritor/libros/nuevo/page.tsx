import { createClient } from '@/lib/supabase/server'
import BookForm from '../../BookForm'

export default async function NuevoLibroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: categories }, { data: profile }] = await Promise.all([
    supabase.from('category').select('id, name').order('name'),
    supabase.from('user').select('delivery_preference').eq('id', user!.id).single(),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Publicar nuevo libro</h1>
      <BookForm categories={categories ?? []} deliveryPreference={profile?.delivery_preference ?? 'platform'} />
    </div>
  )
}
