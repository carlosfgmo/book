import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusLabel: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pendiente',    color: 'bg-stone-100 text-stone-600' },
  paid:       { label: 'Pago enviado', color: 'bg-blue-50 text-blue-700' },
  processing: { label: 'Procesando',   color: 'bg-amber-50 text-amber-700' },
  completed:  { label: 'Completado',   color: 'bg-green-50 text-green-700' },
  cancelled:  { label: 'Cancelado',    color: 'bg-red-50 text-red-700' },
}

export default async function LectorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user')
    .select('full_name, phone, address')
    .eq('id', user!.id)
    .single()

  const { data: orders } = await supabase
    .from('order')
    .select('*, items:order_item(book(title, cover_url))')
    .eq('buyer_id', user!.id)
    .order('created_at', { ascending: false })

  const total     = orders?.length ?? 0
  const completed = orders?.filter(o => o.status === 'completed').length ?? 0
  const pending   = orders?.filter(o => ['pending', 'paid', 'processing'].includes(o.status)).length ?? 0
  const recent    = orders?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Hola, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-stone-400 text-sm mt-0.5">Aquí tienes un resumen de tu actividad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-3xl font-bold text-stone-900">{total}</p>
          <p className="text-xs text-stone-400 mt-1">Pedidos totales</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{completed}</p>
          <p className="text-xs text-stone-400 mt-1">Completados</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{pending}</p>
          <p className="text-xs text-stone-400 mt-1">En proceso</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900 text-sm">Pedidos recientes</h2>
          <Link href="/dashboard/lector/pedidos" className="text-xs text-stone-400 hover:text-stone-700">
            Ver todos →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-10 text-center text-stone-400 text-sm">
            <p className="text-3xl mb-2">🛒</p>
            Aún no tienes pedidos.{' '}
            <Link href="/" className="underline hover:text-stone-700">Explorar catálogo</Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {recent.map((order) => {
              const st = statusLabel[order.status] ?? statusLabel.pending
              const firstBook = (order.items as any[])?.[0]?.book
              return (
                <Link key={order.id} href={`/pedidos/${order.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors">
                  <div className="w-10 h-14 rounded bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                    {firstBook?.cover_url
                      ? <img src={firstBook.cover_url} alt="" className="w-full h-full object-cover" />
                      : '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{firstBook?.title ?? 'Pedido'}</p>
                    <p className="text-xs text-stone-400">{new Date(order.created_at).toLocaleDateString('es-PE')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-stone-900">S/ {Number(order.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Profile quick view */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-stone-900 text-sm">Mis datos</h2>
          <Link href="/dashboard/lector/perfil" className="text-xs text-stone-400 hover:text-stone-700">
            Editar →
          </Link>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <span className="text-stone-400 w-28 shrink-0">Nombre</span>
            <span className="text-stone-700">{profile?.full_name ?? '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-stone-400 w-28 shrink-0">Teléfono</span>
            <span className="text-stone-700">{profile?.phone ?? '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-stone-400 w-28 shrink-0">Dirección</span>
            <span className="text-stone-700">{profile?.address ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
