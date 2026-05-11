import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('user').select('role').eq('id', user.id).single()
  if (!profile?.role?.includes('admin')) redirect('/')

  const admin = createAdminClient()

  const [
    { count: pendingPayments },
    { count: totalUsers },
    { count: totalBooks },
    { count: pendingComments },
    { data: recentPayments },
  ] = await Promise.all([
    admin.from('payment').select('id', { count: 'exact' }).eq('status', 'pending'),
    admin.from('user').select('id', { count: 'exact' }),
    admin.from('book').select('id', { count: 'exact' }).in('status', ['published', 'presale']),
    admin.from('comment').select('id', { count: 'exact' }).eq('is_visible', false),
    admin.from('payment').select(`
      id, status, method, amount, created_at,
      order:order(id, total, buyer:user(full_name))
    `).eq('status', 'pending').order('created_at').limit(5),
  ])

  const methodLabel: Record<string, string> = { yape: 'Yape', plin: 'Plin', bank_transfer: 'Transferencia' }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Panel de administración</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pagos pendientes', value: pendingPayments ?? 0, alert: (pendingPayments ?? 0) > 0, href: '/dashboard/admin/pagos' },
          { label: 'Usuarios', value: totalUsers ?? 0, alert: false, href: null },
          { label: 'Libros activos', value: totalBooks ?? 0, alert: false, href: null },
          { label: 'Comentarios ocultos', value: pendingComments ?? 0, alert: false, href: '/dashboard/admin/moderacion' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border p-4 ${s.alert ? 'border-amber-300' : 'border-stone-200'}`}>
            {s.href ? (
              <Link href={s.href}>
                <p className={`text-2xl font-bold ${s.alert ? 'text-amber-600' : 'text-stone-900'}`}>{s.value}</p>
                <p className="text-xs text-stone-500 mt-0.5 hover:underline">{s.label}</p>
              </Link>
            ) : (
              <>
                <p className="text-2xl font-bold text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagos pendientes */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">Pagos por verificar</h2>
          <Link href="/dashboard/admin/pagos" className="text-xs text-stone-500 hover:underline">
            Ver todos
          </Link>
        </div>
        {!recentPayments?.length ? (
          <div className="p-6 text-center text-stone-400 text-sm">Sin pagos pendientes 🎉</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {recentPayments.map((p: any) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-800">{p.order?.buyer?.full_name}</p>
                  <p className="text-xs text-stone-400">{methodLabel[p.method]} — {new Date(p.created_at).toLocaleDateString('es-PE')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-stone-900">S/ {Number(p.amount).toFixed(2)}</p>
                  <Link href="/dashboard/admin/pagos" className="text-xs text-amber-600 hover:underline">Verificar →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
