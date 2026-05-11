import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PaymentActions from './PaymentActions'

const methodLabel: Record<string, string> = {
  yape: 'Yape',
  plin: 'Plin',
  bank_transfer: 'Transferencia',
}

export default async function PagosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado = 'pending' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('user').select('role').eq('id', user.id).single()
  if (!profile?.role?.includes('admin')) redirect('/')

  const admin = createAdminClient()
  const { data: payments } = await admin
    .from('payment')
    .select(`
      id, method, amount, operation_number, voucher_url, status, created_at,
      order:order(id, total, delivery_mode,
        buyer:user(full_name, phone, email),
        items:order_item(book(title, delivery_type))
      )
    `)
    .eq('status', estado)
    .order('created_at')

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Cola de pagos</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'pending',  label: 'Pendientes' },
          { value: 'verified', label: 'Verificados' },
          { value: 'rejected', label: 'Rechazados' },
        ].map((tab) => (
          <a
            key={tab.value}
            href={`?estado=${tab.value}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              estado === tab.value
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-300 text-stone-600 hover:border-stone-500'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {!payments?.length ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
          No hay pagos en este estado.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment: any) => {
            const order = payment.order
            const buyer = order?.buyer
            const books = order?.items?.map((i: any) => i.book?.title).join(', ')

            return (
              <div key={payment.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-stone-800">{buyer?.full_name}</p>
                    <p className="text-xs text-stone-400">{buyer?.email}</p>
                    {buyer?.phone && <p className="text-xs text-stone-400">{buyer.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-stone-900">S/ {Number(payment.amount).toFixed(2)}</p>
                    <p className="text-xs text-stone-400">{new Date(payment.created_at).toLocaleDateString('es-PE')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-stone-500 font-medium mb-1">Método</p>
                    <p className="text-stone-800">{methodLabel[payment.method]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-medium mb-1">N° Operación</p>
                    <p className="text-stone-800 font-mono text-sm">{payment.operation_number}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-stone-500 font-medium mb-1">Libros</p>
                    <p className="text-stone-800">{books}</p>
                  </div>
                </div>

                {payment.voucher_url && (
                  <div className="mb-4">
                    <p className="text-xs text-stone-500 font-medium mb-2">Comprobante</p>
                    <a href={payment.voucher_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={payment.voucher_url}
                        alt="Voucher"
                        className="max-h-48 rounded-lg border border-stone-200 object-contain"
                      />
                    </a>
                  </div>
                )}

                {estado === 'pending' && (
                  <PaymentActions paymentId={payment.id} orderId={order?.id} />
                )}

                {estado !== 'pending' && (
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                    payment.status === 'verified'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {payment.status === 'verified' ? 'Verificado' : 'Rechazado'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
