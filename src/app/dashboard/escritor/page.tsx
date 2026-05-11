import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookGrid from './BookGrid'

export default async function WriterDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Try with sort_order; if the column doesn't exist yet, fall back
  const primaryRes = await supabase
    .from('book')
    .select('id, title, price, presale_price, cover_url, status, sort_order, release_date')
    .eq('author_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at',  { ascending: true })

  const books = primaryRes.data ?? (
    primaryRes.error
      ? (await supabase
          .from('book')
          .select('id, title, price, presale_price, cover_url, status, release_date')
          .eq('author_id', user.id)
          .order('created_at', { ascending: true })
        ).data
      : null
  )

  const { data: orders } = await supabase
    .from('order_item')
    .select('*, order:order(id, status, created_at, buyer:user(full_name)), book(title)')
    .in('book.author_id', [user.id])
    .order('created_at', { ascending: false })
    .limit(10)

  const published = books?.filter((b) => b.status === 'published').length ?? 0
  const presale   = books?.filter((b) => b.status === 'presale').length ?? 0

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mi panel</h1>
        <Link
          href="/dashboard/escritor/libros/nuevo"
          className="px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors"
        >
          + Publicar libro
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Libros publicados', value: published },
          { label: 'Pre-ventas',        value: presale },
          { label: 'Total libros',      value: books?.length ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-2xl font-bold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mis libros */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-800">Mis libros</h2>
          <p className="text-xs text-stone-400">Arrastra las portadas para cambiar el orden</p>
        </div>
        <BookGrid initialBooks={books ?? []} />
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">Pedidos recientes</h2>
          <Link href="/dashboard/escritor/pedidos" className="text-xs text-stone-500 hover:underline">
            Ver todos
          </Link>
        </div>
        {!orders?.length ? (
          <div className="p-8 text-center text-stone-400 text-sm">Sin pedidos aún.</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {orders?.map((item: any) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-800">{item.book?.title}</p>
                  <p className="text-xs text-stone-400">{item.order?.buyer?.full_name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.delivery_status === 'delivered'  ? 'bg-green-50 text-green-700' :
                  item.delivery_status === 'processing' ? 'bg-amber-50 text-amber-700' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  {item.delivery_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
