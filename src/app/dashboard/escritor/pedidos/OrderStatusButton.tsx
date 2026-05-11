'use client'

import { useTransition } from 'react'
import { updateOrderItemStatus } from '../actions'

const transitions: Record<string, { next: string; label: string }> = {
  pending:    { next: 'processing', label: 'Marcar en proceso' },
  processing: { next: 'delivered',  label: 'Marcar entregado' },
  delivered:  { next: 'delivered',  label: 'Entregado ✓' },
}

export default function OrderStatusButton({
  itemId,
  currentStatus,
}: {
  itemId: string
  currentStatus: string
}) {
  const [pending, startTransition] = useTransition()
  const t = transitions[currentStatus] ?? transitions.pending

  return (
    <button
      disabled={pending || currentStatus === 'delivered'}
      onClick={() => startTransition(() => updateOrderItemStatus(itemId, t.next))}
      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
        currentStatus === 'delivered'
          ? 'bg-green-50 text-green-700 cursor-default'
          : 'bg-stone-900 text-white hover:bg-stone-700'
      } disabled:opacity-60`}
    >
      {pending ? 'Actualizando...' : t.label}
    </button>
  )
}
