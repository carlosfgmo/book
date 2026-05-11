import { createClient } from '@/lib/supabase/server'
import BookForm from '../../BookForm'

export default async function NuevoLibroPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('category')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Publicar nuevo libro</h1>
      <BookForm categories={categories ?? []} />
    </div>
  )
}
