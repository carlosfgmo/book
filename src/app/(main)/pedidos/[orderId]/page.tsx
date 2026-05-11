import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteOrderButton from '../DeleteOrderButton'

const itemStatusLabel: Record<string, string> = {
  pending:    'Pendiente',
  processing: 'En proceso',
  delivered:  'Entregado',
  failed:     'Fallido',
}

const paymentStatusLabel: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Verificando pago', color: 'text-amber-600' },
  verified: { label: 'Pago verificado',  color: 'text-green-600' },
  rejected: { label: 'Pago rechazado',   color: 'text-red-600' },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('order')
    .select('*, items:order_item(*, book(title, cover_url, delivery_type, slug))')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single()

  if (!order) notFound()

  const { data: payment } = await supabase
    .from('payment')
    .select('status, method, amount, operation_number, voucher_url, created_at')
    .eq('order_id', orderId)
    .single()

  const methodLabel: Record<string, string> = {
    yape: 'Yape',
    plin: 'Plin',
    bank_transfer: 'Transferencia bancaria',
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/pedidos" className="text-stone-400 hover:text-stone-600 text-sm">
          ← Mis pedidos
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-stone-900 mb-6">Detalle del pedido</h1>

      {/* Libros */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Libros</h2>
        {(order.items as any[])?.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-14 rounded bg-stone-100 flex items-center justify-center text-xl overflow-hidden">
                {item.book?.cover_url ? (
                  <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                ) : '📖'}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">{item.book?.title}</p>
                <p className="text-xs text-stone-400">{itemStatusLabel[item.delivery_status]}</p>
                {item.delivery_status === 'delivered' && item.download_token && (
                  <a
                    href={`/api/download/${item.download_token}`}
                    className="text-xs text-blue-600 underline mt-0.5 inline-block"
                  >
                    Descargar PDF
                  </a>
                )}
              </div>
            </div>
            <p className="text-sm font-semibold text-stone-900">
              S/ {Number(item.unit_price).toFixed(2)}
            </p>
          </div>
        ))}
        <div className="flex justify-between mt-3 pt-3 border-t border-stone-100">
          <span className="font-semibold text-stone-900">Total pagado</span>
          <span className="font-bold text-stone-900">S/ {Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Estado del pago */}
      {payment ? (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Estado del pago</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Método</span>
              <span className="text-stone-800">{methodLabel[payment.method]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">N° Operación</span>
              <span className="text-stone-800 font-mono">{payment.operation_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Estado</span>
              <span className={`font-medium ${paymentStatusLabel[payment.status]?.color}`}>
                {paymentStatusLabel[payment.status]?.label}
              </span>
            </div>
          </div>
          {payment.status === 'rejected' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              Tu pago fue rechazado. Por favor verifica los datos y contacta al soporte.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-700 text-sm mb-3">Aún no has registrado el comprobante.</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/checkout/${orderId}`}
              className="inline-block px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors"
            >
              Ir a pagar
            </Link>
            <DeleteOrderButton orderId={orderId} />
          </div>
        </div>
      )}
    </main>
  )
}
