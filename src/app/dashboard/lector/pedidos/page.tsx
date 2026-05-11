import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusLabel: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pendiente',    color: 'bg-stone-100 text-stone-600' },
  paid:       { label: 'Pago enviado', color: 'bg-blue-50 text-blue-700' },
  processing: { label: 'Procesando',   color: 'bg-amber-50 text-amber-700' },
  completed:  { label: 'Completado',   color: 'bg-green-50 text-green-700' },
  cancelled:  { label: 'Cancelado',    color: 'bg-red-50 text-red-700' },
}

const PENDING_STATUSES  = ['pending', 'paid', 'processing']
const FINISHED_STATUSES = ['completed', 'cancelled']

export default async function LectorPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'activos' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('order')
    .select('*, items:order_item(book(title, cover_url))')
    .eq('buyer_id', user!.id)
    .order('created_at', { ascending: false })

  const activos    = (orders ?? []).filter(o => PENDING_STATUSES.includes(o.status))
  const historial  = (orders ?? []).filter(o => FINISHED_STATUSES.includes(o.status))
  const shown      = tab === 'historial' ? historial : activos

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {[
          { key: 'activos',   label: `Activos (${activos.length})` },
          { key: 'historial', label: `Historial (${historial.length})` },
        ].map(t => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
            className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-white text-stone-900 font-semibold shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 py-16 text-center text-stone-400">
          <p className="text-4xl mb-3">{tab === 'activos' ? '✅' : '📭'}</p>
          <p>{tab === 'activos' ? 'No tienes pedidos activos' : 'Sin historial aún'}</p>
          {tab === 'activos' && (
            <Link href="/" className="inline-block mt-3 text-sm text-stone-700 underline">
              Ver catálogo
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((order) => {
            const st = statusLabel[order.status] ?? statusLabel.pending
            const items  = order.items as any[]
            const first  = items?.[0]?.book
            const extras = items?.length - 1
            return (
              <Link key={order.id} href={`/pedidos/${order.id}`}>
                <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                  {/* Cover stack */}
                  <div className="relative w-12 h-16 shrink-0">
                    <div className="w-12 h-16 rounded-lg bg-stone-100 overflow-hidden flex items-center justify-center text-xl">
                      {first?.cover_url
                        ? <img src={first.cover_url} alt="" className="w-full h-full object-cover" />
                        : '📖'}
                    </div>
                    {extras > 0 && (
                      <span className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                        +{extras}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm truncate">
                      {first?.title ?? 'Pedido'}
                      {extras > 0 && <span className="text-stone-400"> +{extras} más</span>}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-stone-900 text-sm">S/ {Number(order.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
