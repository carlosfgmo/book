'use client'

import { useActionState, useState } from 'react'
import { submitPayment } from '@/app/(main)/actions'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Method = 'yape' | 'plin' | 'bank_transfer'

const methodLabels: Record<Method, string> = {
  yape: 'Yape',
  plin: 'Plin',
  bank_transfer: 'Transferencia',
}

type BookLine = {
  id: string
  title: string
  cover_url: string | null
  delivery: string
  price: number
}

export default function CheckoutForm({
  orderId,
  total,
  bookLines,
}: {
  orderId: string
  total: number
  bookLines: BookLine[]
}) {
  const [state, formAction, pending] = useActionState(submitPayment, null)
  const [uploading, setUploading]     = useState(false)
  const [voucherUrl, setVoucherUrl]   = useState('')
  const [preview, setPreview]         = useState<string | null>(null)
  const [method, setMethod]           = useState<Method>('yape')
  const [clientError, setClientError] = useState('')

  const isYapePlin = method === 'yape' || method === 'plin'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setClientError('')
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `${orderId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('vouchers').upload(path, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('vouchers').getPublicUrl(data.path)
      setVoucherUrl(urlData.publicUrl)
    }
    setUploading(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!voucherUrl) {
      e.preventDefault()
      setClientError('Debes subir la captura del comprobante antes de confirmar.')
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

      {/* ── Columna izquierda ── */}
      <div className="space-y-4">

        {/* Resumen del pedido */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Resumen del pedido</h2>
          <div className="space-y-4">
            {bookLines.map((line) => (
              <div key={line.id} className="flex items-center gap-4">
                <div className="w-16 h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 relative">
                  {line.cover_url ? (
                    <Image
                      src={line.cover_url}
                      alt={line.title}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 leading-snug">{line.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{line.delivery}</p>
                </div>
                <p className="font-bold text-stone-900 shrink-0">S/ {line.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold text-stone-700">Total a pagar</span>
            <span className="text-2xl font-bold text-stone-900">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Instrucciones de pago */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-800 mb-4">📲 Instrucciones de pago</h2>
          {isYapePlin ? (
            <div className="flex gap-6 items-center">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-amber-100 shrink-0">
                <Image src="/yape/qr.png" alt="QR Yape" width={160} height={160} className="rounded-lg" style={{ width: 160, height: 160 }} priority />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-amber-700">
                  Escanea el QR con tu app de <strong>{methodLabels[method]}</strong> y realiza el pago.
                </p>
                <p className="text-xs text-amber-600">Monto exacto:</p>
                <p className="text-3xl font-bold text-amber-800">S/ {total.toFixed(2)}</p>
                <p className="text-xs text-amber-600">
                  Luego sube la captura del comprobante en el formulario.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-amber-100 space-y-2 text-sm text-amber-700">
                <p><strong>BCP:</strong> 191-123456789-0-12</p>
                <p><strong>Interbank:</strong> 003-3000123456</p>
                <p><strong>CCI BCP:</strong> 00219100123456789012</p>
              </div>
              <p className="text-sm text-amber-700">
                Monto exacto:{' '}
                <span className="text-2xl font-bold text-amber-800">S/ {total.toFixed(2)}</span>
              </p>
              <p className="text-xs text-amber-600">Sube el voucher de la transferencia en el formulario.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Columna derecha ── */}
      <div className="space-y-4">

        {/* Método de pago */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Método de pago</h2>
          <div className="flex gap-2">
            {(Object.keys(methodLabels) as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                  method === m
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'border-stone-300 text-stone-600 hover:border-stone-500'
                }`}
              >
                {methodLabels[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario comprobante */}
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-stone-200 p-5 space-y-4"
        >
          <input type="hidden" name="order_id"   value={orderId} />
          <input type="hidden" name="amount"      value={total} />
          <input type="hidden" name="method"      value={method} />
          <input type="hidden" name="voucher_url" value={voucherUrl} />

          <h2 className="text-sm font-semibold text-stone-700">Registrar comprobante</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Captura del pago
              <span className="ml-1.5 text-xs text-red-500 font-normal">obligatorio</span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors p-5 ${
                voucherUrl
                  ? 'border-green-400 bg-green-50'
                  : clientError
                  ? 'border-red-300 bg-red-50'
                  : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Vista previa" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm text-stone-500 font-medium">Haz clic para subir la captura</p>
                    <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, WEBP</p>
                  </div>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {uploading && <p className="text-xs text-stone-400 mt-1.5">Subiendo imagen...</p>}
            {voucherUrl && !uploading && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Comprobante cargado correctamente
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Número de operación
              <span className="ml-1.5 text-xs text-stone-400 font-normal">(opcional)</span>
            </label>
            <input
              name="operation_number"
              placeholder="Ej. 123456789"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          {(clientError || state?.error) && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {clientError || state?.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || uploading}
            className="w-full py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60 text-sm"
          >
            {pending ? 'Enviando...' : `Confirmar pago — S/ ${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  )
}
