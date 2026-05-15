'use client'

import { useTransition } from 'react'
import { updateOrderItemStatus } from '../actions'

export default function OrderStatusButton({
  itemId,
  currentStatus,
}: {
  itemId: string
  currentStatus: string
}) {
  const [pending, startTransition] = useTransition()
  const delivered = currentStatus === 'delivered'

  function toggle() {
    const next = delivered ? 'pending' : 'delivered'
    startTransition(() => updateOrderItemStatus(itemId, next))
  }

  return (
    <button
      disabled={pending}
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
        delivered
          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          : 'bg-stone-900 text-white hover:bg-stone-700'
      }`}
    >
      {pending ? (
        'Actualizando...'
      ) : delivered ? (
        <>
          <span>✓</span> Entregado — clic para deshacer
        </>
      ) : (
        <>
          <span>📦</span> Marcar como entregado
        </>
      )}
    </button>
  )
}
