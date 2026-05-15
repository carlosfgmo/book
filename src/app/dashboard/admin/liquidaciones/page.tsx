import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LiquidarButton from './LiquidarButton'

const WRITER_SHARE = 0.85
const PLATFORM_SHARE = 0.15

type WriterRow = {
  writerId: string
  fullName: string
  phone: string | null
  sales: { paymentId: string; bookTitle: string; amount: number }[]
}

export default async function LiquidacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>
}) {
  const { vista = 'pendientes' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('user').select('role').eq('id', user.id).single()
  if (!profile?.role?.includes('admin')) redirect('/')

  const admin = createAdminClient()
  const isPending = vista === 'pendientes'

  // Fetch verified payments with order items and book authors
  const { data: payments } = await admin
    .from('payment')
    .select(`
      id, amount, created_at, writer_paid, writer_paid_at,
      order:order(
        items:order_item(
          unit_price,
          book(title, author_id, author:user(id, full_name, phone))
        )
      )
    `)
    .eq('status', 'verified')
    .eq('writer_paid', !isPending)
    .order('created_at', { ascending: false })

  // Group by writer
  const byWriter = new Map<string, WriterRow>()

  for (const payment of payments ?? []) {
    for (const item of (payment.order as any)?.items ?? []) {
      const author = (item.book as any)?.author
      if (!author) continue

      const row = byWriter.get(author.id) ?? {
        writerId: author.id,
        fullName: author.full_name,
        phone: author.phone ?? null,
        sales: [],
      }
      row.sales.push({
        paymentId: payment.id,
        bookTitle: (item.book as any)?.title ?? 'Libro',
        amount: Number(item.unit_price),
      })
      byWriter.set(author.id, row)
    }
  }

  const writers = Array.from(byWriter.values()).sort(
    (a, b) =>
      b.sales.reduce((s, x) => s + x.amount, 0) -
      a.sales.reduce((s, x) => s + x.amount, 0)
  )

  // Totals for header
  const grandTotal   = writers.reduce((s, w) => s + w.sales.reduce((ss, x) => ss + x.amount, 0), 0)
  const writerTotal  = grandTotal * WRITER_SHARE
  const platformTotal = grandTotal * PLATFORM_SHARE

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Liquidaciones a escritores</h1>
        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
          Escritor 85% · Plataforma 15%
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'pendientes', label: 'Por pagar' },
          { value: 'pagados',    label: 'Historial' },
        ].map((tab) => (
          <a
            key={tab.value}
            href={`?vista=${tab.value}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              vista === tab.value
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-300 text-stone-600 hover:border-stone-500'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Summary bar */}
      {writers.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Ventas brutas',        value: grandTotal,    color: 'text-stone-900' },
            { label: 'A depositar (85%)',     value: writerTotal,   color: 'text-green-700' },
            { label: 'Comisión plataforma (15%)', value: platformTotal, color: 'text-stone-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
              <p className={`text-xl font-bold ${s.color}`}>S/ {s.value.toFixed(2)}</p>
              <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Writer cards */}
      {writers.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center text-stone-400 text-sm">
          {isPending ? 'No hay pagos pendientes de liquidar 🎉' : 'Aún no hay liquidaciones registradas.'}
        </div>
      ) : (
        <div className="space-y-4">
          {writers.map((w) => {
            const gross    = w.sales.reduce((s, x) => s + x.amount, 0)
            const toDeposit = gross * WRITER_SHARE
            const commission = gross * PLATFORM_SHARE
            const paymentIds = [...new Set(w.sales.map((s) => s.paymentId))]

            // Group sales by book title
            const byBook = new Map<string, number>()
            for (const s of w.sales) {
              byBook.set(s.bookTitle, (byBook.get(s.bookTitle) ?? 0) + s.amount)
            }

            return (
              <div key={w.writerId} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-stone-900">{w.fullName}</p>
                    {w.phone && (
                      <p className="text-sm text-stone-500 mt-0.5">
                        📱 {w.phone}
                        <span className="ml-2 text-xs text-stone-400">(Yape / transferencia)</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">S/ {toDeposit.toFixed(2)}</p>
                    <p className="text-xs text-stone-400">a depositar</p>
                  </div>
                </div>

                {/* Book breakdown */}
                <div className="border-t border-stone-100 pt-3 mb-4 space-y-1">
                  {Array.from(byBook.entries()).map(([title, amount]) => (
                    <div key={title} className="flex justify-between text-sm">
                      <span className="text-stone-600 truncate max-w-xs">{title}</span>
                      <span className="text-stone-900 font-medium shrink-0 ml-4">
                        S/ {amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fee summary */}
                <div className="bg-stone-50 rounded-lg p-3 flex gap-6 text-sm mb-4">
                  <div>
                    <p className="text-xs text-stone-400">Ventas brutas</p>
                    <p className="font-semibold text-stone-700">S/ {gross.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Comisión 15%</p>
                    <p className="font-semibold text-stone-500">− S/ {commission.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Al escritor 85%</p>
                    <p className="font-bold text-green-700">S/ {toDeposit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Ventas</p>
                    <p className="font-semibold text-stone-700">{paymentIds.length}</p>
                  </div>
                </div>

                {isPending && (
                  <LiquidarButton
                    paymentIds={paymentIds}
                    writerName={w.fullName}
                    amount={toDeposit}
                  />
                )}

                {!isPending && (
                  <span className="inline-block text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                    ✓ Pagado
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
