'use client'

import { useTransition } from 'react'
import { verifyPayment } from '../actions'

export default function PaymentActions({
  paymentId,
  orderId,
}: {
  paymentId: string
  orderId: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex gap-3 border-t border-stone-100 pt-4">
      <button
        disabled={pending}
        onClick={() => startTransition(() => verifyPayment(paymentId, orderId, true))}
        className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {pending ? '...' : '✓ Aprobar pago'}
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => verifyPayment(paymentId, orderId, false))}
        className="flex-1 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-60"
      >
        {pending ? '...' : '✕ Rechazar'}
      </button>
    </div>
  )
}
