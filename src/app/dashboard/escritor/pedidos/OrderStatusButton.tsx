'use client'

import { useTransition, useState } from 'react'
import { updateOrderItemStatus } from '../actions'

export default function OrderStatusButton({
  itemId,
  currentStatus,
}: {
  itemId: string
  currentStatus: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const delivered = currentStatus === 'delivered'

  function toggle() {
    const next = delivered ? 'pending' : 'delivered'
    setError(null)
    startTransition(async () => {
      const result = await updateOrderItemStatus(itemId, next)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={toggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
          delivered
            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            : 'bg-stone-900 text-white hover:bg-stone-700'
        }`}
      >
        {pending ? 'Actualizando...' : delivered ? '✓ Entregado — clic para deshacer' : '📦 Marcar como entregado'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
