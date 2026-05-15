'use client'

import { useTransition, useState } from 'react'
import { markWriterLiquidated } from '@/app/dashboard/admin/actions'

export default function LiquidarButton({
  paymentIds,
  writerName,
  amount,
}: {
  paymentIds: string[]
  writerName: string
  amount: number
}) {
  const [pending, startTransition] = useTransition()
  const [confirmed, setConfirmed] = useState(false)

  if (confirmed) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-stone-600">
          ¿Confirmas que depositaste{' '}
          <strong className="text-green-700">S/ {amount.toFixed(2)}</strong>{' '}
          a <strong>{writerName}</strong>?
        </p>
        <button
          onClick={() => startTransition(() => markWriterLiquidated(paymentIds))}
          disabled={pending}
          className="px-4 py-1.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 shrink-0"
        >
          {pending ? 'Guardando...' : 'Sí, confirmar'}
        </button>
        <button
          onClick={() => setConfirmed(false)}
          disabled={pending}
          className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirmed(true)}
      className="w-full py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 transition-colors"
    >
      Marcar como pagado — S/ {amount.toFixed(2)}
    </button>
  )
}
