import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteOrderButton from './DeleteOrderButton'

const statusLabel: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pendiente',    color: 'bg-stone-100 text-stone-600' },
  paid:       { label: 'Pago enviado', color: 'bg-blue-50 text-blue-700' },
  processing: { label: 'Procesando',   color: 'bg-amber-50 text-amber-700' },
  completed:  { label: 'Completado',   color: 'bg-green-50 text-green-700' },
  cancelled:  { label: 'Cancelado',    color: 'bg-red-50 text-red-700' },
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('order')
    .select('*, items:order_item(book(title, cover_url))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Mis pedidos</h1>

      {orders?.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🛒</p>
          <p>Aún no tienes pedidos</p>
          <Link href="/" className="inline-block mt-4 text-sm text-stone-800 underline">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => {
            const st = statusLabel[order.status] ?? statusLabel.pending
            const firstBook = (order.items as any[])?.[0]?.book
            const canDelete = order.status === 'pending'
            return (
              <div key={order.id} className="bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow">
                <Link href={`/pedidos/${order.id}`} className="flex items-center gap-4 p-4">
                  <div className="w-12 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                    {firstBook?.cover_url ? (
                      <img src={firstBook.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm truncate">
                      {firstBook?.title ?? 'Pedido'}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-stone-900 text-sm">
                      S/ {Number(order.total).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </Link>
                {canDelete && (
                  <div className="px-4 pb-3 flex justify-end border-t border-stone-50 pt-2">
                    <DeleteOrderButton orderId={order.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
