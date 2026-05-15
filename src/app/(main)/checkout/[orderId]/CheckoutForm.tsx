'use client'

import { useActionState, useState } from 'react'
import { submitPayment } from '@/app/(main)/actions'
import Image from 'next/image'

type Method = 'yape' | 'plin' | 'bank_transfer'

const methodLabels: Record<Method, string> = {
  yape:          'Yape',
  plin:          'Plin',
  bank_transfer: 'Transferencia',
}

type BookLine = {
  id: string
  title: string
  cover_url: string | null
  delivery: string
  deliveryType: string
  price: number
}

export default function CheckoutForm({
  orderId,
  total,
  bookLines,
  userEmail     = '',
  userPhone     = '',
  isAuthenticated,
}: {
  orderId: string
  total: number
  bookLines: BookLine[]
  userEmail?: string
  userPhone?: string
  isAuthenticated: boolean
}) {
  const [state, formAction, pending] = useActionState(submitPayment, null)

  // Payment
  const [method, setMethod]         = useState<Method>('yape')
  const [uploading, setUploading]   = useState(false)
  const [voucherUrl, setVoucherUrl] = useState('')
  const [preview, setPreview]       = useState<string | null>(null)

  // Contact
  const [email, setEmail]           = useState(userEmail)
  const [phone, setPhone]           = useState(userPhone)
  const [hasWhatsapp, setHasWhatsapp] = useState(false)

  // Delivery
  const [pdfDelivery, setPdfDelivery]         = useState<'email' | 'whatsapp'>('email')
  const [physicalAddress, setPhysicalAddress] = useState('')

  const [clientError, setClientError] = useState('')

  const hasPDF      = bookLines.some(b => b.deliveryType === 'pdf' || b.deliveryType === 'both')
  const hasPhysical = bookLines.some(b => b.deliveryType === 'physical' || b.deliveryType === 'both')
  const isYapePlin  = method === 'yape' || method === 'plin'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setClientError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('order_id', orderId)
    const res  = await fetch('/api/upload-voucher', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.url) {
      setVoucherUrl(json.url)
    } else {
      setClientError('Error al subir el comprobante. Intenta de nuevo.')
    }
    setUploading(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setClientError('')
    if (!email.trim()) {
      e.preventDefault()
      setClientError('El correo electrónico es obligatorio.')
      return
    }
    if (!phone.trim()) {
      e.preventDefault()
      setClientError('El número de teléfono es obligatorio.')
      return
    }
    if (!voucherUrl) {
      e.preventDefault()
      setClientError('Debes subir la captura del comprobante antes de confirmar.')
    }
  }

  // Success state for anonymous users
  if (state?.success) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">¡Pedido registrado!</h2>
        <p className="text-stone-600 mb-2">
          Tu comprobante fue recibido. Verificaremos tu pago y procesaremos el pedido.
        </p>
        <p className="text-stone-500 text-sm">
          Te confirmaremos al correo <strong className="text-stone-700">{email}</strong>
        </p>
        {hasPDF && (
          <p className="text-stone-400 text-xs mt-3">
            El PDF será enviado{' '}
            {pdfDelivery === 'whatsapp'
              ? `por WhatsApp al ${phone}`
              : `al correo ${email}`}
          </p>
        )}
      </div>
    )
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
                    <Image src={line.cover_url} alt={line.title} fill sizes="64px" className="object-contain" />
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
                <Image src="/yape/qr.png" alt="QR Yape" width={320} height={320} className="rounded-lg" style={{ width: 320, height: 320 }} priority />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-amber-700">
                  Escanea el QR con tu app de <strong>{methodLabels[method]}</strong> y realiza el pago.
                </p>
                <p className="text-xs text-amber-600">Monto exacto:</p>
                <p className="text-3xl font-bold text-amber-800">S/ {total.toFixed(2)}</p>
                <p className="text-xs text-amber-600">Luego sube la captura del comprobante.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-amber-100 space-y-2 text-sm text-amber-700">
                <p><strong>Caja Arequipa:</strong> 00516036402100001012</p>
                <p><strong>Interbank:</strong> 8983334298878</p>
                <p><strong>CCI:</strong> 003-898-013334298878-48</p>
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

      {/* ── Columna derecha — un solo <form> ── */}
      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden fields */}
        <input type="hidden" name="order_id"            value={orderId} />
        <input type="hidden" name="amount"              value={total} />
        <input type="hidden" name="method"              value={method} />
        <input type="hidden" name="voucher_url"         value={voucherUrl} />
        <input type="hidden" name="buyer_email"         value={email} />
        <input type="hidden" name="buyer_phone"         value={phone} />
        <input type="hidden" name="buyer_whatsapp"      value={String(hasWhatsapp)} />
        <input type="hidden" name="pdf_delivery_method" value={pdfDelivery} />
        <input type="hidden" name="physical_address"    value={physicalAddress} />

        {/* ── Datos de contacto ── */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700">Datos de contacto</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Correo electrónico
              <span className="ml-1.5 text-xs text-red-500 font-normal">obligatorio</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
              readOnly={isAuthenticated}
            />
            {isAuthenticated && (
              <p className="text-xs text-stone-400 mt-1">Correo de tu cuenta registrada</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Número de teléfono
              <span className="ml-1.5 text-xs text-red-500 font-normal">obligatorio</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ej. 987654321"
                className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={() => {
                  setHasWhatsapp(!hasWhatsapp)
                  if (hasWhatsapp) setPdfDelivery('email')
                }}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors font-medium whitespace-nowrap ${
                  hasWhatsapp
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-stone-300 text-stone-500 hover:border-stone-400'
                }`}
              >
                {hasWhatsapp ? '✓ WhatsApp' : 'WhatsApp?'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Entrega ── */}
        {(hasPDF || hasPhysical) && (
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-stone-700">Entrega</h2>

            {hasPDF && (
              <div>
                <p className="text-sm text-stone-600 mb-2">¿Cómo deseas recibir el PDF?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfDelivery('email')}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                      pdfDelivery === 'email'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-300 text-stone-600 hover:border-stone-500'
                    }`}
                  >
                    📧 Por correo
                  </button>
                  <button
                    type="button"
                    disabled={!hasWhatsapp}
                    onClick={() => hasWhatsapp && setPdfDelivery('whatsapp')}
                    title={!hasWhatsapp ? 'Activa WhatsApp en los datos de contacto' : ''}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                      pdfDelivery === 'whatsapp'
                        ? 'bg-green-600 text-white border-green-600'
                        : hasWhatsapp
                        ? 'border-stone-300 text-stone-600 hover:border-stone-500'
                        : 'border-stone-200 text-stone-300 cursor-not-allowed'
                    }`}
                  >
                    📱 Por WhatsApp
                  </button>
                </div>
                {!hasWhatsapp && (
                  <p className="text-xs text-stone-400 mt-1.5">
                    Activa WhatsApp arriba para habilitar esta opción
                  </p>
                )}
              </div>
            )}

            {hasPhysical && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Para el libro físico — coordinaremos la entrega
                </label>
                <textarea
                  value={physicalAddress}
                  onChange={e => setPhysicalAddress(e.target.value)}
                  placeholder="Distrito, referencias o notas para coordinar la entrega..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Método de pago ── */}
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

        {/* ── Comprobante ── */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
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
                  : clientError && !voucherUrl
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
        </div>

        {(clientError || state?.error) && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
            {clientError || state?.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || uploading}
          className="w-full py-3.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60 text-sm"
        >
          {pending ? 'Enviando...' : `Confirmar pago — S/ ${total.toFixed(2)}`}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-stone-400">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-stone-600 underline hover:text-stone-900">
              Inicia sesión
            </a>{' '}
            para ver tu historial de pedidos
          </p>
        )}
      </form>
    </div>
  )
}
