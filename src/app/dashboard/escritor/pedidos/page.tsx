import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import OrderStatusButton from './OrderStatusButton'

export default async function EscritorPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Get all books by this author first
  const { data: authorBooks } = await admin
    .from('book')
    .select('id')
    .eq('author_id', user.id)

  const bookIds = (authorBooks ?? []).map((b: any) => b.id)

  const { data: items } = bookIds.length > 0
    ? await admin
        .from('order_item')
        .select(`
          id, quantity, unit_price, delivery_status,
          book(id, title, delivery_type),
          order:order(id, status, delivery_mode, shipping_address, created_at,
            buyer_email, buyer_phone, pdf_delivery_method, physical_address,
            buyer:user(full_name, phone, address),
            payment(status, method)
          )
        `)
        .in('book_id', bookIds)
        .order('id', { ascending: false })
    : { data: [] }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Pedidos de mis libros</h1>

      {!items?.length ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
          Sin pedidos aún.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => {
            const order = item.order
            const buyer = order?.buyer
            const payment = order?.payment
            const paymentVerified = payment?.status === 'verified'

            const dt = order?.created_at ? new Date(order.created_at) : null
            const tz = { timeZone: 'America/Lima' }
            const dateStr = dt?.toLocaleDateString('es-PE', tz) ?? ''
            const timeStr = dt?.toLocaleTimeString('es-PE', { ...tz, hour: '2-digit', minute: '2-digit' }) ?? ''

            const deliveryType = item.book?.delivery_type
            const pdfMethod = order?.pdf_delivery_method
            const buyerName  = buyer?.full_name ?? order?.buyer_email ?? '—'
            const buyerEmail = order?.buyer_email ?? ''
            const buyerPhone = order?.buyer_phone ?? buyer?.phone ?? ''

            const voucherUploaded = !!payment
            const paymentRejected = payment?.status === 'rejected'
            const delivered       = item.delivery_status === 'delivered'

            const step1 = voucherUploaded
            const step2 = paymentVerified
            const step3 = delivered

            return (
              <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-stone-800">{item.book?.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{dateStr} {timeStr}</p>
                  </div>
                  <p className="font-bold text-stone-900">S/ {Number(item.unit_price).toFixed(2)}</p>
                </div>

                {/* Buyer + delivery info */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Comprador</p>
                    <p className="text-stone-800">{buyerName}</p>
                    {buyerEmail && <p className="text-stone-500 text-xs">{buyerEmail}</p>}
                    {buyerPhone && <p className="text-stone-500 text-xs">{buyerPhone}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Enviar por</p>
                    {(deliveryType === 'pdf' || deliveryType === 'both') && (
                      <p className="text-stone-800">
                        PDF → {pdfMethod === 'whatsapp' ? `WhatsApp ${buyerPhone}` : `correo ${buyerEmail}`}
                      </p>
                    )}
                    {(deliveryType === 'physical' || deliveryType === 'both') && (
                      <p className="text-stone-800 mt-0.5">Físico</p>
                    )}
                    {order?.physical_address && (
                      <p className="text-stone-500 text-xs mt-0.5">{order.physical_address}</p>
                    )}
                  </div>
                </div>

                {/* Progress steps */}
                <div className="border-t border-stone-100 pt-4">
                  <div className="flex items-start gap-0">

                    {/* Step 1 */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        step1 ? 'bg-blue-500 text-white' : 'bg-stone-200 text-stone-400'
                      }`}>
                        {step1 ? '✓' : '1'}
                      </div>
                      <p className={`text-xs text-center leading-tight ${step1 ? 'text-blue-600 font-medium' : 'text-stone-400'}`}>
                        Voucher<br/>subido
                      </p>
                    </div>

                    <div className={`flex-1 h-0.5 mt-3.5 ${step1 ? 'bg-blue-300' : 'bg-stone-200'}`} />

                    {/* Step 2 */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        paymentRejected ? 'bg-red-500 text-white'
                        : step2 ? 'bg-green-500 text-white'
                        : step1 ? 'bg-amber-400 text-white'
                        : 'bg-stone-200 text-stone-400'
                      }`}>
                        {paymentRejected ? '✕' : step2 ? '✓' : '2'}
                      </div>
                      <p className={`text-xs text-center leading-tight ${
                        paymentRejected ? 'text-red-600 font-medium'
                        : step2 ? 'text-green-600 font-medium'
                        : step1 ? 'text-amber-600'
                        : 'text-stone-400'
                      }`}>
                        Pago<br/>{paymentRejected ? 'rechazado' : step2 ? 'aprobado' : 'en revisión'}
                      </p>
                    </div>

                    <div className={`flex-1 h-0.5 mt-3.5 ${step2 ? 'bg-green-300' : 'bg-stone-200'}`} />

                    {/* Step 3 */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        step3 ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-400'
                      }`}>
                        {step3 ? '✓' : '3'}
                      </div>
                      <p className={`text-xs text-center leading-tight ${step3 ? 'text-green-600 font-medium' : 'text-stone-400'}`}>
                        Libro<br/>{step3 ? 'entregado' : 'por entregar'}
                      </p>
                    </div>

                  </div>

                  {/* Delivery action — only show when payment is verified */}
                  {paymentVerified && (
                    <div className="mt-4 flex justify-end">
                      <OrderStatusButton itemId={item.id} currentStatus={item.delivery_status} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
